/**
 * Rust API Types - TypeScript interfaces matching Rust serverless function responses
 *
 * These types are auto-generated from the Rust structs in /api/src/*.rs
 * Keep them in sync when modifying the Rust implementations.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MDX PARSER TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
}

export interface MdxMetadata {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: TeamMember[];
  link?: string;
}

export interface ParsedMdx {
  metadata: MdxMetadata;
  content: string;
  slug: string;
}

export interface MdxParseRequest {
  files: Array<{
    slug: string;
    content: string;
  }>;
}

export type MdxParseResult = ParsedMdx | { slug: string; error: string };

export interface MdxParseResponse {
  posts: MdxParseResult[];
  parsedCount: number;
  errorCount: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE DRIVE CONTENT TYPES (Nested folder CMS structure)
// Structure: [Category] / [Slug-Folder] / index.mdx + images
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Content category for Drive CMS folder routing */
export type ContentCategory = "projects" | "canva";

/** Request to fetch MDX content from Google Drive by category + slug */
export interface DriveContentRequest {
  /** Content category: projects or canva */
  category: ContentCategory;
  /** Slug to search for (matches subfolder name) */
  slug: string;
}

/** Legacy request format with direct file ID */
export interface LegacyDriveRequest {
  /** Google Drive file ID */
  fileId: string;
  /** Optional: Slug override (defaults to fileId) */
  slug?: string;
}

/** Drive error types for structured error handling */
export type DriveErrorCode =
  | "FOLDER_NOT_FOUND"
  | "INDEX_NOT_FOUND"
  | "ACCESS_DENIED"
  | "API_ERROR";

/** Structured Drive error response */
export interface DriveErrorResponse {
  error: {
    type: "folder_not_found" | "index_not_found" | "access_denied" | "api_error";
    slug?: string;
    category?: string;
    folder_id?: string;
    message?: string;
    status?: number;
  };
  message: string;
  code: DriveErrorCode;
}

/** Response status for async content loading */
export type ContentStatus = "loading" | "success" | "error" | "not-found" | "index-missing";

/** Async content wrapper to prevent CLS on mobile */
export interface AsyncContent<T> {
  status: ContentStatus;
  data: T | null;
  error: string | null;
  /** Timestamp for cache invalidation */
  fetchedAt: number | null;
}

/** Helper to create loading state */
export function createLoadingState<T>(): AsyncContent<T> {
  return {
    status: "loading",
    data: null,
    error: null,
    fetchedAt: null,
  };
}

/** Helper to create success state */
export function createSuccessState<T>(data: T): AsyncContent<T> {
  return {
    status: "success",
    data,
    error: null,
    fetchedAt: Date.now(),
  };
}

/** Helper to create error state */
export function createErrorState<T>(error: string): AsyncContent<T> {
  return {
    status: "error",
    data: null,
    error,
    fetchedAt: null,
  };
}

/** Helper to create not-found state */
export function createNotFoundState<T>(): AsyncContent<T> {
  return {
    status: "not-found",
    data: null,
    error: "Content not found",
    fetchedAt: null,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN MANIFEST TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ImageEntry {
  path: string;
  name: string;
  extension: string;
  folder: string;
}

export interface DesignManifestResponse {
  images: ImageEntry[];
  count: number;
  generatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RustApiError {
  error: string;
}

export type RustApiResult<T> = T | RustApiError;

export function isRustApiError(result: unknown): result is RustApiError {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof (result as RustApiError).error === "string"
  );
}

// Type guard for successful MDX parse
export function isParsedMdx(result: MdxParseResult): result is ParsedMdx {
  return "metadata" in result && "content" in result;
}
