//! Design Manifest - Vercel Serverless Function
//!
//! Fast recursive directory traversal and JSON manifest generation.
//! Supports filtering by extension and returns structured design data.
//!
//! Usage:
//!   GET /api/design-manifest?path=/designs

use serde::Serialize;
use std::path::Path;
use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};

const IMAGE_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp", "gif", "svg"];

#[derive(Serialize)]
struct ManifestResponse {
    images: Vec<ImageEntry>,
    count: usize,
    #[serde(rename = "generatedAt")]
    generated_at: String,
}

#[derive(Serialize)]
struct ImageEntry {
    path: String,
    name: String,
    extension: String,
    folder: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    // Parse query parameters
    let uri = req.uri();
    let query: std::collections::HashMap<String, String> = uri
        .query()
        .map(|q| {
            url::form_urlencoded::parse(q.as_bytes())
                .into_owned()
                .collect()
        })
        .unwrap_or_default();

    // Default to public/designs in Vercel environment
    let base_path = query
        .get("path")
        .map(|p| p.as_str())
        .unwrap_or("public/designs");

    // Verify path is safe (no path traversal)
    if base_path.contains("..") {
        return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .header("Content-Type", "application/json")
            .body(Body::Text(r#"{"error":"Invalid path: directory traversal not allowed"}"#.into()))?);
    }

    // Walk directory and collect images
    let images = walk_directory(base_path);

    let response = ManifestResponse {
        count: images.len(),
        images,
        generated_at: now_iso8601(),
    };

    let json = serde_json::to_string(&response)?;
    
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
        .body(Body::Text(json))?)
}

/// Recursively walk directory and collect image files
fn walk_directory(base: &str) -> Vec<ImageEntry> {
    let mut results = Vec::new();
    walk_recursive(Path::new(base), base, &mut results);
    results
}

fn walk_recursive(path: &Path, base: &str, results: &mut Vec<ImageEntry>) {
    let Ok(entries) = std::fs::read_dir(path) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();

        if path.is_dir() {
            walk_recursive(&path, base, results);
        } else if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if IMAGE_EXTENSIONS.contains(&ext.to_lowercase().as_str()) {
                let relative = path
                    .strip_prefix(base)
                    .unwrap_or(&path)
                    .to_string_lossy()
                    .replace('\\', "/");

                let name = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                let folder = path
                    .parent()
                    .and_then(|p| p.strip_prefix(base).ok())
                    .map(|p| p.to_string_lossy().replace('\\', "/"))
                    .unwrap_or_default();

                results.push(ImageEntry {
                    path: relative,
                    name,
                    extension: ext.to_lowercase(),
                    folder,
                });
            }
        }
    }
}

/// Get current time as ISO8601 string
fn now_iso8601() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let year = 1970 + (now / 31_536_000);
    let remaining = now % 31_536_000;
    let month = 1 + (remaining / 2_592_000) % 12;
    let day = 1 + (remaining / 86_400) % 31;

    format!("{:04}-{:02}-{:02}T00:00:00Z", year, month, day)
}
