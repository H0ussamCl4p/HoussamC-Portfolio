//! MDX Frontmatter Parser - High-performance zero-copy parsing
//!
//! This module provides efficient parsing of MDX frontmatter using
//! serde_yaml for zero-copy deserialization where possible.

use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use thiserror::Error;

/// Team member in frontmatter
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TeamMember<'a> {
    #[serde(borrow)]
    pub name: Cow<'a, str>,
    #[serde(borrow)]
    pub role: Cow<'a, str>,
    #[serde(borrow)]
    pub avatar: Cow<'a, str>,
    #[serde(borrow, default)]
    pub linked_in: Cow<'a, str>,
}

/// MDX Frontmatter metadata - Zero-copy where possible
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MdxMetadata<'a> {
    #[serde(borrow)]
    pub title: Cow<'a, str>,
    #[serde(borrow, default)]
    pub published_at: Cow<'a, str>,
    #[serde(borrow, default)]
    pub summary: Cow<'a, str>,
    #[serde(borrow, default)]
    pub image: Option<Cow<'a, str>>,
    #[serde(default)]
    pub images: Vec<Cow<'a, str>>,
    #[serde(borrow, default)]
    pub tag: Option<Cow<'a, str>>,
    #[serde(default)]
    pub team: Vec<TeamMember<'a>>,
    #[serde(borrow, default)]
    pub link: Option<Cow<'a, str>>,
}

/// Parsed MDX file with frontmatter and content
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedMdx<'a> {
    #[serde(borrow)]
    pub metadata: MdxMetadata<'a>,
    #[serde(borrow)]
    pub content: Cow<'a, str>,
    #[serde(borrow)]
    pub slug: Cow<'a, str>,
}

/// Owned version for JSON response (no lifetimes)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnedTeamMember {
    pub name: String,
    pub role: String,
    pub avatar: String,
    #[serde(default)]
    pub linked_in: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnedMdxMetadata {
    pub title: String,
    #[serde(default)]
    pub published_at: String,
    #[serde(default)]
    pub summary: String,
    pub image: Option<String>,
    #[serde(default)]
    pub images: Vec<String>,
    pub tag: Option<String>,
    #[serde(default)]
    pub team: Vec<OwnedTeamMember>,
    pub link: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnedParsedMdx {
    pub metadata: OwnedMdxMetadata,
    pub content: String,
    pub slug: String,
}

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("No frontmatter found (missing '---' delimiters)")]
    NoFrontmatter,
    #[error("Invalid frontmatter YAML: {0}")]
    InvalidYaml(#[from] serde_yaml::Error),
    #[error("File read error: {0}")]
    FileError(String),
}

/// Extract frontmatter from MDX content using zero-copy slicing
/// Returns (frontmatter_yaml, content_body)
fn extract_frontmatter(content: &str) -> Result<(&str, &str), ParseError> {
    let content = content.trim_start();

    // Must start with '---'
    if !content.starts_with("---") {
        return Err(ParseError::NoFrontmatter);
    }

    // Find the closing '---'
    let rest = &content[3..];
    let end_idx = rest
        .find("\n---")
        .ok_or(ParseError::NoFrontmatter)?;

    let frontmatter = rest[..end_idx].trim();
    let body = rest[end_idx + 4..].trim_start();

    Ok((frontmatter, body))
}

/// Parse MDX file content into structured metadata (zero-copy)
pub fn parse_mdx_content<'a>(
    content: &'a str,
    slug: &'a str,
) -> Result<ParsedMdx<'a>, ParseError> {
    let (frontmatter_yaml, body) = extract_frontmatter(content)?;

    let metadata: MdxMetadata<'a> = serde_yaml::from_str(frontmatter_yaml)?;

    Ok(ParsedMdx {
        metadata,
        content: Cow::Borrowed(body),
        slug: Cow::Borrowed(slug),
    })
}

/// Parse MDX and return owned data (for JSON serialization)
pub fn parse_mdx_owned(content: &str, slug: &str) -> Result<OwnedParsedMdx, ParseError> {
    let parsed = parse_mdx_content(content, slug)?;

    Ok(OwnedParsedMdx {
        metadata: OwnedMdxMetadata {
            title: parsed.metadata.title.into_owned(),
            published_at: parsed.metadata.published_at.into_owned(),
            summary: parsed.metadata.summary.into_owned(),
            image: parsed.metadata.image.map(|s| s.into_owned()),
            images: parsed.metadata.images.into_iter().map(|s| s.into_owned()).collect(),
            tag: parsed.metadata.tag.map(|s| s.into_owned()),
            team: parsed.metadata.team.into_iter().map(|t| OwnedTeamMember {
                name: t.name.into_owned(),
                role: t.role.into_owned(),
                avatar: t.avatar.into_owned(),
                linked_in: t.linked_in.into_owned(),
            }).collect(),
            link: parsed.metadata.link.map(|s| s.into_owned()),
        },
        content: parsed.content.into_owned(),
        slug: parsed.slug.into_owned(),
    })
}

/// Batch parse multiple MDX files
pub fn parse_mdx_batch(files: &[(String, String)]) -> Vec<Result<OwnedParsedMdx, String>> {
    files
        .iter()
        .map(|(slug, content)| {
            parse_mdx_owned(content, slug).map_err(|e| e.to_string())
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_frontmatter() {
        let content = r#"---
title: "Test Post"
publishedAt: "2024-01-15"
summary: "A test summary"
images:
  - "/img1.png"
  - "/img2.png"
team:
  - name: "Houssam"
    role: "Developer"
    avatar: "/avatar.png"
    linkedIn: "https://linkedin.com"
---

# Hello World

This is the content.
"#;

        let result = parse_mdx_owned(content, "test-post").unwrap();
        assert_eq!(result.metadata.title, "Test Post");
        assert_eq!(result.metadata.published_at, "2024-01-15");
        assert_eq!(result.metadata.images.len(), 2);
        assert_eq!(result.metadata.team.len(), 1);
        assert!(result.content.contains("# Hello World"));
    }
}
