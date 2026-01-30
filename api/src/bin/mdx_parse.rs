//! MDX Parse - Vercel Serverless Function
//!
//! High-performance MDX frontmatter parsing with Google Drive CMS integration.
//! Supports nested folder structure: [Category] / [Slug-Folder] / index.mdx
//!
//! Structure:
//!   Projects / atlas-ai / index.mdx + thumbnail.png
//!   Blog / my-post / index.mdx + header.png
//!   Canva / design-1 / index.mdx + assets/
//!
//! Usage:
//!   POST /api/mdx-parse
//!   Body: { "category": "projects", "slug": "atlas-ai" }
//!   Body: { "category": "blog", "slug": "my-post" }
//!   Body: { "category": "canva", "slug": "design-1" }
//!
//!   // Legacy local mode:
//!   POST /api/mdx-parse
//!   Body: { "files": [{"slug": "my-post", "content": "---\ntitle: ...\n---\n..."}] }

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::Utc;
use dashmap::DashMap;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use once_cell::sync::Lazy;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::env;
use std::time::{Duration, Instant};
use vercel_runtime::{run, Body, Error, Request, RequestPayloadExt, Response, StatusCode};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT CATEGORIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Content category determines which Drive folder to search
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
enum ContentCategory {
    Projects,
    Blog,
    Canva,
}

impl ContentCategory {
    /// Get the environment variable name for this category's folder ID
    fn env_var_name(&self) -> &'static str {
        match self {
            ContentCategory::Projects => "DRIVE_PROJECTS_FOLDER_ID",
            ContentCategory::Blog => "DRIVE_BLOG_FOLDER_ID",
            ContentCategory::Canva => "DRIVE_CANVA_FOLDER_ID",
        }
    }

    /// Get the folder ID from environment
    fn get_folder_id(&self) -> Result<String, String> {
        env::var(self.env_var_name()).map_err(|_| {
            format!(
                "{} environment variable not set",
                self.env_var_name()
            )
        })
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IN-MEMORY CACHE FOR GOOGLE DRIVE CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Cache entry with content and expiration
struct CacheEntry {
    content: String,
    fetched_at: Instant,
}

/// Slug to subfolder mapping cache entry (stores subfolder_id for two-tier lookup)
struct SlugMapping {
    /// The index.mdx file ID within the subfolder
    file_id: String,
    /// The subfolder ID (slug-named folder) - used for image resolution
    subfolder_id: String,
    fetched_at: Instant,
}

/// Error types for structured error responses
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum DriveError {
    /// Slug folder not found in category
    FolderNotFound { slug: String, category: String },
    /// Folder exists but index.mdx is missing
    IndexNotFound { slug: String, category: String, folder_id: String },
    /// Authentication or permission error
    AccessDenied { message: String },
    /// Generic Drive API error
    ApiError { message: String, status: u16 },
}

/// Global in-memory cache for Drive file contents (5 min TTL)
static DRIVE_CACHE: Lazy<DashMap<String, CacheEntry>> = Lazy::new(DashMap::new);

/// Global cache for slug -> fileId mappings (1 hour TTL)
static SLUG_CACHE: Lazy<DashMap<String, SlugMapping>> = Lazy::new(DashMap::new);

/// Content cache TTL: 5 minutes
const CONTENT_CACHE_TTL_SECS: u64 = 300;

/// Slug mapping cache TTL: 1 hour
const SLUG_CACHE_TTL_SECS: u64 = 3600;

/// Check if content cache entry is still valid
fn is_content_cache_valid(entry: &CacheEntry) -> bool {
    entry.fetched_at.elapsed() < Duration::from_secs(CONTENT_CACHE_TTL_SECS)
}

/// Check if slug mapping is still valid
fn is_slug_cache_valid(entry: &SlugMapping) -> bool {
    entry.fetched_at.elapsed() < Duration::from_secs(SLUG_CACHE_TTL_SECS)
}

/// Generate cache key for category + slug
fn slug_cache_key(category: ContentCategory, slug: &str) -> String {
    format!("{:?}:{}", category, slug)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE SERVICE ACCOUNT JWT CLAIMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#[derive(Debug, Serialize)]
struct JwtClaims {
    iss: String,        // Service account email
    scope: String,      // OAuth scopes
    aud: String,        // Token endpoint
    exp: i64,           // Expiration time
    iat: i64,           // Issued at
}

#[derive(Debug, Deserialize)]
struct ServiceAccountKey {
    client_email: String,
    private_key: String,
    #[allow(dead_code)]
    project_id: Option<String>,
}

#[derive(Debug, Deserialize)]
struct TokenResponse {
    access_token: String,
    #[allow(dead_code)]
    expires_in: u64,
}

/// Google Drive file search result
#[derive(Debug, Deserialize)]
struct DriveFileList {
    files: Vec<DriveFile>,
}

#[derive(Debug, Deserialize)]
struct DriveFile {
    id: String,
    name: String,
    #[serde(rename = "mimeType")]
    mime_type: String,
    #[allow(dead_code)]
    parents: Option<Vec<String>>,
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE DRIVE API FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Parse Service Account JSON from environment variable
/// Supports both direct JSON and Base64-encoded JSON
fn get_service_account() -> Result<ServiceAccountKey, String> {
    // Try GOOGLE_SERVICE_ACCOUNT_JSON first
    if let Ok(json_str) = env::var("GOOGLE_SERVICE_ACCOUNT_JSON") {
        // Try direct JSON first
        if let Ok(sa) = serde_json::from_str::<ServiceAccountKey>(&json_str) {
            return Ok(sa);
        }
        // Try base64-decoded
        if let Ok(decoded) = BASE64.decode(&json_str) {
            if let Ok(decoded_str) = String::from_utf8(decoded) {
                if let Ok(sa) = serde_json::from_str::<ServiceAccountKey>(&decoded_str) {
                    return Ok(sa);
                }
            }
        }
    }

    // Try GOOGLE_SA_BASE64 fallback
    if let Ok(b64_str) = env::var("GOOGLE_SA_BASE64") {
        let decoded = BASE64
            .decode(&b64_str)
            .map_err(|e| format!("Failed to decode GOOGLE_SA_BASE64: {}", e))?;
        let decoded_str = String::from_utf8(decoded)
            .map_err(|e| format!("Invalid UTF-8 in GOOGLE_SA_BASE64: {}", e))?;
        return serde_json::from_str(&decoded_str)
            .map_err(|e| format!("Failed to parse service account JSON: {}", e));
    }

    Err("Neither GOOGLE_SERVICE_ACCOUNT_JSON nor GOOGLE_SA_BASE64 environment variable is set".into())
}

/// Build optimized HTTP client with TLS 1.3 and connection pooling
fn build_http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .min_tls_version(reqwest::tls::Version::TLS_1_2)
        .https_only(true)
        .pool_max_idle_per_host(2)
        .pool_idle_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))
}

/// Generate JWT for Google OAuth2
fn generate_jwt(sa: &ServiceAccountKey) -> Result<String, String> {
    let now = Utc::now().timestamp();
    let claims = JwtClaims {
        iss: sa.client_email.clone(),
        scope: "https://www.googleapis.com/auth/drive.readonly".to_string(),
        aud: "https://oauth2.googleapis.com/token".to_string(),
        iat: now,
        exp: now + 3600, // 1 hour
    };

    let header = Header::new(Algorithm::RS256);

    // Parse PEM private key
    let key = EncodingKey::from_rsa_pem(sa.private_key.as_bytes())
        .map_err(|e| format!("Invalid private key: {}", e))?;

    encode(&header, &claims, &key).map_err(|e| format!("JWT encoding failed: {}", e))
}

/// Exchange JWT for access token
async fn get_access_token(client: &reqwest::Client, sa: &ServiceAccountKey) -> Result<String, String> {
    let jwt = generate_jwt(sa)?;

    let params = [
        ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
        ("assertion", &jwt),
    ];

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Token request failed: {}", e))?;

    if !resp.status().is_success() {
        let error_text = resp.text().await.unwrap_or_default();
        return Err(format!("Token exchange failed: {}", error_text));
    }

    let token_resp: TokenResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))?;

    Ok(token_resp.access_token)
}

/// Search for a file by slug within a specific folder
/// Returns the file ID if found
async fn search_file_by_slug(
    client: &reqwest::Client,
    access_token: &str,
    folder_id: &str,
    slug: &str,
) -> Result<Option<String>, String> {
    // Search for .mdx file matching slug name
    let query = format!(
        "name contains '{}' and '{}' in parents and (mimeType='text/mdx' or mimeType='text/markdown' or name contains '.mdx' or name contains '.md') and trashed=false",
        slug, folder_id
    );

    let url = format!(
        "https://www.googleapis.com/drive/v3/files?q={}&fields=files(id,name,mimeType,parents)",
        urlencoding::encode(&query)
    );

    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Drive search failed: {}", e))?;

    if !resp.status().is_success() {
        let error_text = resp.text().await.unwrap_or_default();
        return Err(format!("Drive search error: {}", error_text));
    }

    let file_list: DriveFileList = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse file list: {}", e))?;

    // Find exact match (slug.mdx or slug.md)
    for file in &file_list.files {
        let name_lower = file.name.to_lowercase();
        let slug_lower = slug.to_lowercase();
        if name_lower == format!("{}.mdx", slug_lower)
            || name_lower == format!("{}.md", slug_lower)
            || name_lower == slug_lower
        {
            return Ok(Some(file.id.clone()));
        }
    }

    // Return first partial match if no exact match
    Ok(file_list.files.first().map(|f| f.id.clone()))
}

/// Step A: Search for a subfolder named {slug} within the category folder
/// Returns the subfolder ID if found
async fn search_subfolder_by_slug(
    client: &reqwest::Client,
    access_token: &str,
    category_folder_id: &str,
    slug: &str,
) -> Result<Option<String>, String> {
    // Search for folder with exact slug name
    let query = format!(
        "name='{}' and '{}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
        slug, category_folder_id
    );

    let url = format!(
        "https://www.googleapis.com/drive/v3/files?q={}&fields=files(id,name,mimeType)",
        urlencoding::encode(&query)
    );

    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Subfolder search failed: {}", e))?;

    if !resp.status().is_success() {
        let error_text = resp.text().await.unwrap_or_default();
        return Err(format!("Drive subfolder search error: {}", error_text));
    }

    let file_list: DriveFileList = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse subfolder list: {}", e))?;

    // Return exact match
    Ok(file_list.files.first().map(|f| f.id.clone()))
}

/// Step B: Search for index.mdx or content.mdx inside the subfolder
/// Returns the file ID if found
async fn search_index_in_subfolder(
    client: &reqwest::Client,
    access_token: &str,
    subfolder_id: &str,
) -> Result<Option<String>, String> {
    // Search for index.mdx or content.mdx
    let query = format!(
        "(name='index.mdx' or name='content.mdx' or name='index.md' or name='content.md') and '{}' in parents and trashed=false",
        subfolder_id
    );

    let url = format!(
        "https://www.googleapis.com/drive/v3/files?q={}&fields=files(id,name,mimeType)",
        urlencoding::encode(&query)
    );

    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Index file search failed: {}", e))?;

    if !resp.status().is_success() {
        let error_text = resp.text().await.unwrap_or_default();
        return Err(format!("Drive index search error: {}", error_text));
    }

    let file_list: DriveFileList = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse index file list: {}", e))?;

    // Prefer index.mdx over content.mdx
    for preferred in &["index.mdx", "index.md", "content.mdx", "content.md"] {
        if let Some(file) = file_list.files.iter().find(|f| f.name.to_lowercase() == *preferred) {
            return Ok(Some(file.id.clone()));
        }
    }

    Ok(None)
}

/// Search for an image file within a folder by name
/// Searches exclusively in the subfolder to prevent cross-project collisions
async fn search_image_in_folder(
    client: &reqwest::Client,
    access_token: &str,
    folder_id: &str,
    image_name: &str,
) -> Result<Option<String>, String> {
    let query = format!(
        "name='{}' and '{}' in parents and trashed=false",
        image_name, folder_id
    );

    let url = format!(
        "https://www.googleapis.com/drive/v3/files?q={}&fields=files(id,name)",
        urlencoding::encode(&query)
    );

    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Image search failed: {}", e))?;

    if !resp.status().is_success() {
        return Ok(None);
    }

    let file_list: DriveFileList = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse image list: {}", e))?;

    Ok(file_list.files.first().map(|f| f.id.clone()))
}

/// Two-tier file ID resolution for nested folder structure
/// Step A: Find subfolder by slug name
/// Step B: Find index.mdx inside subfolder
/// Returns (file_id, subfolder_id) for content fetching and image resolution
async fn resolve_file_id(
    client: &reqwest::Client,
    access_token: &str,
    category: ContentCategory,
    slug: &str,
) -> Result<(String, String), DriveError> {
    let cache_key = slug_cache_key(category, slug);

    // Check slug cache - returns both file_id and subfolder_id
    if let Some(mapping) = SLUG_CACHE.get(&cache_key) {
        if is_slug_cache_valid(&mapping) {
            return Ok((mapping.file_id.clone(), mapping.subfolder_id.clone()));
        }
    }

    // Get category folder ID
    let category_folder_id = category.get_folder_id().map_err(|e| DriveError::ApiError {
        message: e,
        status: 500,
    })?;

    // Step A: Search for subfolder named {slug}
    let subfolder_id = search_subfolder_by_slug(client, access_token, &category_folder_id, slug)
        .await
        .map_err(|e| DriveError::ApiError {
            message: e,
            status: 500,
        })?
        .ok_or_else(|| DriveError::FolderNotFound {
            slug: slug.to_string(),
            category: format!("{:?}", category),
        })?;

    // Step B: Search for index.mdx inside subfolder
    let file_id = search_index_in_subfolder(client, access_token, &subfolder_id)
        .await
        .map_err(|e| DriveError::ApiError {
            message: e,
            status: 500,
        })?
        .ok_or_else(|| DriveError::IndexNotFound {
            slug: slug.to_string(),
            category: format!("{:?}", category),
            folder_id: subfolder_id.clone(),
        })?;

    // Cache the mapping (stores subfolder_id for image resolution)
    SLUG_CACHE.insert(
        cache_key,
        SlugMapping {
            file_id: file_id.clone(),
            subfolder_id: subfolder_id.clone(),
            fetched_at: Instant::now(),
        },
    );

    Ok((file_id, subfolder_id))
}

/// Fetch file content from Google Drive by file ID
/// Uses in-memory cache to avoid redundant API calls
async fn fetch_drive_file(client: &reqwest::Client, access_token: &str, file_id: &str) -> Result<String, String> {
    // Check content cache first
    if let Some(entry) = DRIVE_CACHE.get(file_id) {
        if is_content_cache_valid(&entry) {
            return Ok(entry.content.clone());
        }
    }

    // Fetch file content from Drive API
    let url = format!(
        "https://www.googleapis.com/drive/v3/files/{}?alt=media",
        file_id
    );

    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Drive API request failed: {}", e))?;

    match resp.status().as_u16() {
        200 => {
            let content = resp
                .text()
                .await
                .map_err(|e| format!("Failed to read file content: {}", e))?;

            // Store in cache
            DRIVE_CACHE.insert(
                file_id.to_string(),
                CacheEntry {
                    content: content.clone(),
                    fetched_at: Instant::now(),
                },
            );

            Ok(content)
        }
        404 => Err(format!("File not found: {}", file_id)),
        403 => Err("Access denied. Check file sharing permissions.".to_string()),
        401 => Err("Authentication failed. Check service account credentials.".to_string()),
        status => {
            let error_text = resp.text().await.unwrap_or_default();
            Err(format!("Drive API error {}: {}", status, error_text))
        }
    }
}

/// Generate Google Drive direct download URL for an image
fn drive_image_url(file_id: &str) -> String {
    format!("https://drive.google.com/uc?export=view&id={}", file_id)
}

/// Resolve relative image paths in MDX content to Drive URLs
/// Uses the subfolder_id to ensure images are resolved from the correct project folder
async fn resolve_image_paths(
    client: &reqwest::Client,
    access_token: &str,
    subfolder_id: &str,
    content: &str,
) -> String {
    // Regex to match Markdown images: ![alt](path)
    let re = Regex::new(r"!\[([^\]]*)\]\(([^)]+)\)").unwrap();
    let mut resolved_content = content.to_string();

    // Collect all matches first to avoid borrow issues
    let matches: Vec<(String, String, String)> = re
        .captures_iter(content)
        .filter_map(|cap| {
            let full_match = cap.get(0)?.as_str().to_string();
            let alt = cap.get(1)?.as_str().to_string();
            let path = cap.get(2)?.as_str().to_string();

            // Only process relative paths (not URLs)
            if path.starts_with("http://") || path.starts_with("https://") || path.starts_with('/') {
                return None;
            }

            Some((full_match, alt, path))
        })
        .collect();

    // Resolve each image from the subfolder exclusively
    for (full_match, alt, path) in matches {
        // Extract filename from path (handles ./pic.png, assets/pic.png, pic.png)
        let filename = path.rsplit('/').next().unwrap_or(&path);

        // Search for image in the subfolder (not category folder)
        if let Ok(Some(image_id)) = search_image_in_folder(client, access_token, subfolder_id, filename).await {
            let new_url = drive_image_url(&image_id);
            let new_markdown = format!("![{}]({})", alt, new_url);
            resolved_content = resolved_content.replace(&full_match, &new_markdown);
        }
    }

    resolved_content
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MDX PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Parse MDX content into structured metadata (zero-copy for frontmatter)
fn parse_mdx_owned(content: &str, slug: &str) -> Result<OwnedParsedMdx, String> {
    let content = content.trim_start();

    if !content.starts_with("---") {
        return Err("No frontmatter delimiter found".into());
    }

    let after_first = &content[3..];
    let end_pos = after_first
        .find("\n---")
        .ok_or_else(|| "No closing frontmatter delimiter found".to_string())?;

    let frontmatter_str = after_first[..end_pos].trim();
    let content_start = 3 + end_pos + 4;
    let body_content = if content_start < content.len() {
        content[content_start..].trim()
    } else {
        ""
    };

    let metadata: serde_yaml::Value =
        serde_yaml::from_str(frontmatter_str).map_err(|e| format!("YAML parse error: {}", e))?;

    let metadata_map = metadata
        .as_mapping()
        .ok_or_else(|| "Frontmatter is not a YAML mapping".to_string())?;

    let get_string = |key: &str| -> Option<String> {
        metadata_map
            .get(&serde_yaml::Value::String(key.into()))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
    };

    let get_string_array = |key: &str| -> Vec<String> {
        metadata_map
            .get(&serde_yaml::Value::String(key.into()))
            .and_then(|v| v.as_sequence())
            .map(|seq| {
                seq.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default()
    };

    Ok(OwnedParsedMdx {
        slug: slug.to_string(),
        title: get_string("title").unwrap_or_default(),
        summary: get_string("summary"),
        published_at: get_string("publishedAt").unwrap_or_default(),
        updated_at: get_string("updatedAt"),
        image: get_string("image"),
        images: get_string_array("images"),
        tags: get_string_array("tag"),
        team: get_string_array("team"),
        link: get_string("link"),
        content: body_content.to_string(),
        content_preview: body_content.chars().take(200).collect(),
    })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST/RESPONSE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#[derive(Serialize)]
struct OwnedParsedMdx {
    slug: String,
    title: String,
    summary: Option<String>,
    #[serde(rename = "publishedAt")]
    published_at: String,
    #[serde(rename = "updatedAt")]
    updated_at: Option<String>,
    image: Option<String>,
    images: Vec<String>,
    tags: Vec<String>,
    team: Vec<String>,
    link: Option<String>,
    content: String,
    #[serde(rename = "contentPreview")]
    content_preview: String,
}

#[derive(Deserialize)]
struct ParseRequest {
    /// Legacy: local files to parse
    #[serde(default)]
    files: Vec<FileInput>,
    /// Content category: "projects", "blog", or "canva"
    #[serde(default)]
    category: Option<ContentCategory>,
    /// Slug to search for in the category folder
    #[serde(default)]
    slug: Option<String>,
    /// Legacy: Content source - "local" (default) or "drive"
    #[serde(default)]
    source: Option<String>,
    /// Legacy: Direct Google Drive file ID
    #[serde(rename = "fileId")]
    #[serde(default)]
    file_id: Option<String>,
}

#[derive(Deserialize)]
struct FileInput {
    slug: String,
    content: String,
}

#[derive(Serialize)]
struct ParseResponse {
    posts: Vec<ParseResult>,
    #[serde(rename = "parsedCount")]
    parsed_count: usize,
    #[serde(rename = "errorCount")]
    error_count: usize,
    source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    cached: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    category: Option<ContentCategory>,
}

#[derive(Serialize)]
#[serde(untagged)]
enum ParseResult {
    Success(OwnedParsedMdx),
    Error { slug: String, error: String },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    if req.method() != "POST" {
        return Ok(Response::builder()
            .status(StatusCode::METHOD_NOT_ALLOWED)
            .header("Content-Type", "application/json")
            .body(Body::Text(
                r#"{"error":"Method not allowed. Use POST."}"#.into(),
            ))?);
    }

    let request: ParseRequest = match req.payload::<ParseRequest>() {
        Ok(Some(r)) => r,
        Ok(None) => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::Text(r#"{"error":"Empty request body"}"#.into()))?);
        }
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::Text(
                    format!(r#"{{"error":"Invalid JSON: {}"}}"#, e).into(),
                ))?);
        }
    };

    // ── New: Category-based folder routing ──────────────────────────
    if let (Some(category), Some(slug)) = (request.category, &request.slug) {
        return handle_category_request(category, slug).await;
    }

    // ── Legacy: Direct Drive file ID ────────────────────────────────
    let source = request.source.as_deref().unwrap_or("local");
    if source == "drive" {
        let file_id = match &request.file_id {
            Some(id) if !id.is_empty() => id.clone(),
            _ => {
                return Ok(Response::builder()
                    .status(StatusCode::BAD_REQUEST)
                    .header("Content-Type", "application/json")
                    .body(Body::Text(
                        r#"{"error":"Missing fileId for drive source"}"#.into(),
                    ))?);
            }
        };

        let slug = request.slug.unwrap_or_else(|| file_id.clone());
        return handle_legacy_drive_request(&file_id, &slug).await;
    }

    // ── Legacy: Local files ─────────────────────────────────────────
    if request.files.is_empty() {
        return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .header("Content-Type", "application/json")
            .body(Body::Text(r#"{"error":"No files provided"}"#.into()))?);
    }

    let mut posts = Vec::with_capacity(request.files.len());
    let mut error_count = 0usize;

    for file in request.files {
        match parse_mdx_owned(&file.content, &file.slug) {
            Ok(parsed) => posts.push(ParseResult::Success(parsed)),
            Err(e) => {
                error_count += 1;
                posts.push(ParseResult::Error {
                    slug: file.slug,
                    error: e,
                });
            }
        }
    }

    let parsed_count = posts.len() - error_count;

    let response = ParseResponse {
        posts,
        parsed_count,
        error_count,
        source: "local".to_string(),
        cached: None,
        category: None,
    };

    let json = serde_json::to_string(&response)?;

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=600",
        )
        .body(Body::Text(json))?)
}

/// Handle category-based request (projects, blog, canva)
async fn handle_category_request(
    category: ContentCategory,
    slug: &str,
) -> Result<Response<Body>, Error> {
    // Build optimized HTTP client
    let client = match build_http_client() {
        Ok(c) => c,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    // Get service account and access token
    let sa = match get_service_account() {
        Ok(sa) => sa,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    let access_token = match get_access_token(&client, &sa).await {
        Ok(token) => token,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    // Check if slug mapping was cached
    let cache_key = slug_cache_key(category, slug);
    let slug_was_cached = SLUG_CACHE
        .get(&cache_key)
        .map(|e| is_slug_cache_valid(&e))
        .unwrap_or(false);

    // Two-tier resolution: subfolder lookup + index.mdx lookup
    let (file_id, subfolder_id) = match resolve_file_id(&client, &access_token, category, slug).await {
        Ok(ids) => ids,
        Err(drive_error) => {
            // Return structured error response
            let (status, error_json) = match &drive_error {
                DriveError::FolderNotFound { slug, category } => (
                    StatusCode::NOT_FOUND,
                    serde_json::json!({
                        "error": drive_error,
                        "message": format!("Folder '{}' not found in {} category", slug, category),
                        "code": "FOLDER_NOT_FOUND"
                    }),
                ),
                DriveError::IndexNotFound { slug, category, folder_id } => (
                    StatusCode::NOT_FOUND,
                    serde_json::json!({
                        "error": drive_error,
                        "message": format!("index.mdx not found in '{}' folder", slug),
                        "code": "INDEX_NOT_FOUND",
                        "folder_id": folder_id
                    }),
                ),
                DriveError::AccessDenied { message } => (
                    StatusCode::FORBIDDEN,
                    serde_json::json!({
                        "error": drive_error,
                        "message": message,
                        "code": "ACCESS_DENIED"
                    }),
                ),
                DriveError::ApiError { message, status } => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    serde_json::json!({
                        "error": drive_error,
                        "message": message,
                        "code": "API_ERROR",
                        "status": status
                    }),
                ),
            };
            return Ok(Response::builder()
                .status(status)
                .header("Content-Type", "application/json")
                .body(Body::Text(error_json.to_string()))?);
        }
    };

    // Check content cache
    let content_was_cached = DRIVE_CACHE
        .get(&file_id)
        .map(|e| is_content_cache_valid(&e))
        .unwrap_or(false);

    // Fetch file content
    let content = match fetch_drive_file(&client, &access_token, &file_id).await {
        Ok(c) => c,
        Err(e) => {
            let status = if e.contains("not found") {
                StatusCode::NOT_FOUND
            } else if e.contains("Access denied") || e.contains("Authentication") {
                StatusCode::FORBIDDEN
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };
            return Ok(Response::builder()
                .status(status)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    // Resolve relative image paths using subfolder_id (not category folder)
    let resolved_content = resolve_image_paths(&client, &access_token, &subfolder_id, &content).await;

    // Parse MDX
    match parse_mdx_owned(&resolved_content, slug) {
        Ok(mut parsed) => {
            // Update content with resolved image paths
            parsed.content = resolved_content
                .split("\n---")
                .skip(1)
                .next()
                .and_then(|s| s.strip_prefix("\n"))
                .unwrap_or(&parsed.content)
                .trim()
                .to_string();

            let response = ParseResponse {
                posts: vec![ParseResult::Success(parsed)],
                parsed_count: 1,
                error_count: 0,
                source: "drive".to_string(),
                cached: Some(slug_was_cached && content_was_cached),
                category: Some(category),
            };
            let json = serde_json::to_string(&response)?;
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .header(
                    "Cache-Control",
                    "public, s-maxage=300, stale-while-revalidate=600",
                )
                .body(Body::Text(json))?)
        }
        Err(e) => {
            let response = ParseResponse {
                posts: vec![ParseResult::Error {
                    slug: slug.to_string(),
                    error: e,
                }],
                parsed_count: 0,
                error_count: 1,
                source: "drive".to_string(),
                cached: None,
                category: Some(category),
            };
            let json = serde_json::to_string(&response)?;
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::Text(json))?)
        }
    }
}

/// Handle legacy drive request with direct file ID
async fn handle_legacy_drive_request(file_id: &str, slug: &str) -> Result<Response<Body>, Error> {
    let client = match build_http_client() {
        Ok(c) => c,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    let sa = match get_service_account() {
        Ok(sa) => sa,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    let access_token = match get_access_token(&client, &sa).await {
        Ok(token) => token,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::Text(format!(r#"{{"error":"{}"}}"#, e).into()))?);
        }
    };

    let was_cached = DRIVE_CACHE
        .get(file_id)
        .map(|e| is_content_cache_valid(&e))
        .unwrap_or(false);

    match fetch_drive_file(&client, &access_token, file_id).await {
        Ok(content) => match parse_mdx_owned(&content, slug) {
            Ok(parsed) => {
                let response = ParseResponse {
                    posts: vec![ParseResult::Success(parsed)],
                    parsed_count: 1,
                    error_count: 0,
                    source: "drive".to_string(),
                    cached: Some(was_cached),
                    category: None,
                };
                let json = serde_json::to_string(&response)?;
                Ok(Response::builder()
                    .status(StatusCode::OK)
                    .header("Content-Type", "application/json")
                    .header(
                        "Cache-Control",
                        "public, s-maxage=300, stale-while-revalidate=600",
                    )
                    .body(Body::Text(json))?)
            }
            Err(e) => {
                let response = ParseResponse {
                    posts: vec![ParseResult::Error {
                        slug: slug.to_string(),
                        error: e,
                    }],
                    parsed_count: 0,
                    error_count: 1,
                    source: "drive".to_string(),
                    cached: None,
                    category: None,
                };
                let json = serde_json::to_string(&response)?;
                Ok(Response::builder()
                    .status(StatusCode::OK)
                    .header("Content-Type", "application/json")
                    .body(Body::Text(json))?)
            }
        },
        Err(e) => {
            let status = if e.contains("not found") {
                StatusCode::NOT_FOUND
            } else if e.contains("Access denied") || e.contains("Authentication") {
                StatusCode::FORBIDDEN
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };
            Ok(Response::builder()
                .status(status)
                .header("Content-Type", "application/json")
                .body(Body::Text(
                    format!(r#"{{"error":"{}","fileId":"{}"}}"#, e, file_id).into(),
                ))?)
        }
    }
}
