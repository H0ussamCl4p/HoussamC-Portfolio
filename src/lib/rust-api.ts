/**
 * Rust API Client - Server-side integration for Rust serverless functions
 *
 * This module provides type-safe wrappers for calling Rust APIs from
 * Next.js Server Components and Server Actions.
 *
 * NOTE: Google Drive API calls should be made from Server Components only
 * to keep Service Account keys secure.
 */

import type {
  MdxParseRequest,
  MdxParseResponse,
  DesignManifestResponse,
  RustApiError,
  DriveContentRequest,
  LegacyDriveRequest,
  AsyncContent,
  ParsedMdx,
  ContentCategory,
} from "@/types/rust-api.types";
import {
  createSuccessState,
  createErrorState,
  createNotFoundState,
} from "@/types/rust-api.types";

// Use environment variable for API base URL (allows local dev override)
const RUST_API_BASE = process.env.RUST_API_BASE || "";

/**
 * Determine the correct API URL based on environment
 * - In production on Vercel: Use VERCEL_URL or relative URLs
 * - In development: Use localhost or RUST_API_BASE
 */
function getApiUrl(endpoint: string): string {
  if (RUST_API_BASE) {
    return `${RUST_API_BASE}${endpoint}`;
  }

  // On Vercel, use the deployment URL for server-side requests
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}${endpoint}`;
  }

  // In development, use localhost
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000${endpoint}`;
  }

  // In the browser/client, a relative URL is fine.
  if (typeof window !== "undefined") {
    return endpoint;
  }

  // In Node/server (including `next build`), fetch() requires an absolute URL.
  // This fallback keeps local production builds from throwing ERR_INVALID_URL.
  return `http://localhost:3000${endpoint}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MDX PARSER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Parse MDX files using Rust serverless function
 *
 * @example
 * ```ts
 * const result = await parseMdxBatch([
 *   { slug: "my-post", content: "---\ntitle: Hello\n---\n# Content" }
 * ]);
 * ```
 */
export async function parseMdxBatch(
  files: MdxParseRequest["files"],
): Promise<MdxParseResponse | RustApiError> {
  try {
    const response = await fetch(getApiUrl("/api/mdx-parse"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
      // Enable caching for static content
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      return error as RustApiError;
    }

    return (await response.json()) as MdxParseResponse;
  } catch (error) {
    return { error: `Failed to parse MDX: ${error}` };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE DRIVE MDX (Nested folder routing)
// Structure: [Category] / [Slug-Folder] / index.mdx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Fetch MDX content from Google Drive by category and slug
 *
 * Uses two-tier lookup:
 * 1. Find subfolder named {slug} in category folder
 * 2. Find index.mdx inside that subfolder
 *
 * NOTE: This function should ONLY be called from Server Components
 * to keep the Service Account credentials secure.
 *
 * @example
 * ```ts
 * // In a Server Component:
 * const content = await fetchDriveMdx("projects", "atlas-ai");
 * if (content.status === "success") {
 *   return <MdxRenderer content={content.data} />;
 * }
 * ```
 */
export async function fetchDriveMdx(
  category: ContentCategory,
  slug: string,
): Promise<AsyncContent<ParsedMdx>> {
  const apiUrl = getApiUrl("/api/mdx-parse");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, slug }),
      next: { revalidate: 3600 },
    });

    if (response.status === 404) {
      // Check for specific error type
      const errorData = await response.json().catch(() => null);
      if (errorData?.code === "INDEX_NOT_FOUND") {
        // Folder exists but index.mdx is missing
        return {
          status: "index-missing",
          data: null,
          error: errorData.message || "index.mdx not found in folder",
          fetchedAt: null,
        };
      }
      return createNotFoundState();
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      return createErrorState((error as RustApiError).error || error.message);
    }

    const data = (await response.json()) as MdxParseResponse;
    const firstPost = data.posts[0];

    if (!firstPost || "error" in firstPost) {
      return createErrorState(
        "error" in (firstPost || {})
          ? (firstPost as { error: string }).error
          : "Failed to parse MDX",
      );
    }

    return createSuccessState(firstPost as ParsedMdx);
  } catch (error) {
    return createErrorState(`Failed to fetch Drive content: ${error}`);
  }
}

/**
 * Legacy: Fetch MDX content from Google Drive by direct file ID
 *
 * @deprecated Use fetchDriveMdx(category, slug) instead
 */
export async function fetchDriveMdxById(
  request: LegacyDriveRequest,
): Promise<AsyncContent<ParsedMdx>> {
  const { fileId, slug } = request;

  try {
    const response = await fetch(getApiUrl("/api/mdx-parse"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "drive",
        fileId,
        slug: slug || fileId,
      }),
      next: { revalidate: 300 },
    });

    if (response.status === 404) {
      return createNotFoundState();
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      return createErrorState((error as RustApiError).error);
    }

    const data = (await response.json()) as MdxParseResponse;
    const firstPost = data.posts[0];

    if (!firstPost || "error" in firstPost) {
      return createErrorState(
        "error" in (firstPost || {})
          ? (firstPost as { error: string }).error
          : "Failed to parse MDX",
      );
    }

    return createSuccessState(firstPost as ParsedMdx);
  } catch (error) {
    return createErrorState(`Failed to fetch Drive content: ${error}`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN MANIFEST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get design manifest using Rust serverless function
 *
 * @example
 * ```ts
 * const manifest = await fetchDesignManifestRust("/designs");
 * if (!isRustApiError(manifest)) {
 *   console.log(`Found ${manifest.count} images`);
 * }
 * ```
 */
export async function fetchDesignManifestRust(
  path = "public/designs",
): Promise<DesignManifestResponse | RustApiError> {
  try {
    const params = new URLSearchParams({ path });

    const response = await fetch(getApiUrl(`/api/design-manifest?${params}`), {
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      return error as RustApiError;
    }

    return (await response.json()) as DesignManifestResponse;
  } catch (error) {
    return { error: `Failed to fetch design manifest: ${error}` };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER ACTIONS (for use in Server Components)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { isRustApiError } from "@/types/rust-api.types";
