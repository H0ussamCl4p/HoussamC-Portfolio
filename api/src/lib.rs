//! Portfolio Rust API - Shared library for all serverless functions
//!
//! This module provides high-performance implementations for:
//! - MDX frontmatter parsing (zero-copy YAML)
//! - Design manifest generation
//! - Google Drive content fetching (preparation)

pub mod mdx;
pub mod response;

pub use mdx::*;
pub use response::*;
