//! Portfolio WASM Module - Client-side utilities compiled to WebAssembly
//!
//! This module is compiled to WASM for client-side use in React components.
//! Build with: wasm-pack build --target web --out-dir ../public/wasm
//!
//! Use cases:
//! - Client-side slug generation (URL-safe strings)
//! - Text processing for search/filtering
//! - Performance-critical animations/calculations

use wasm_bindgen::prelude::*;

/// Generate a URL-safe slug from text
/// Matches the algorithm used in mdx.tsx for heading links
#[wasm_bindgen]
pub fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| match c {
            ' ' | '\t' | '\n' => '-',
            '&' => '-',
            c if c.is_alphanumeric() || c == '-' => c,
            _ => '\0',
        })
        .filter(|&c| c != '\0')
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

/// Fast text search with fuzzy matching
/// Returns indices of matching characters for highlighting
#[wasm_bindgen]
pub fn fuzzy_match(text: &str, pattern: &str) -> Option<Vec<usize>> {
    if pattern.is_empty() {
        return Some(vec![]);
    }

    let text_lower = text.to_lowercase();
    let pattern_lower = pattern.to_lowercase();
    let mut pattern_chars = pattern_lower.chars().peekable();
    let mut indices = Vec::new();

    for (i, c) in text_lower.chars().enumerate() {
        if let Some(&p) = pattern_chars.peek() {
            if c == p {
                indices.push(i);
                pattern_chars.next();
            }
        }
    }

    if pattern_chars.peek().is_none() {
        Some(indices)
    } else {
        None
    }
}

/// Calculate reading time estimate
/// Returns minutes based on average reading speed of 200 wpm
#[wasm_bindgen]
pub fn reading_time(content: &str) -> u32 {
    let words = content.split_whitespace().count();
    let minutes = (words as f64 / 200.0).ceil() as u32;
    std::cmp::max(1, minutes)
}

/// Extract text content from MDX (strips frontmatter and markdown)
#[wasm_bindgen]
pub fn extract_text(mdx: &str) -> String {
    let content = mdx
        .trim()
        .strip_prefix("---")
        .and_then(|s| s.find("\n---").map(|i| &s[i + 4..]))
        .unwrap_or(mdx);

    // Simple markdown stripping (for search indexing)
    content
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.starts_with('#')
                && !trimmed.starts_with("```")
                && !trimmed.starts_with('!')
                && !trimmed.starts_with('[')
        })
        .collect::<Vec<_>>()
        .join(" ")
        .trim()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slugify() {
        assert_eq!(slugify("Hello World"), "hello-world");
        assert_eq!(slugify("This & That"), "this-that");
        assert_eq!(slugify("Multiple   Spaces"), "multiple-spaces");
    }

    #[test]
    fn test_fuzzy_match() {
        assert!(fuzzy_match("Hello World", "hw").is_some());
        assert!(fuzzy_match("Hello World", "xyz").is_none());
    }

    #[test]
    fn test_reading_time() {
        let short = "One two three four five";
        assert_eq!(reading_time(short), 1);

        let long = "word ".repeat(400);
        assert_eq!(reading_time(&long), 2);
    }
}
