/**
 * MDX Parse API Route - Google Drive CMS Integration
 *
 * Fetches MDX content from Google Drive with nested folder structure:
 * [Category] / [Slug-Folder] / index.mdx + images
 *
 * POST /api/mdx-parse
 * Body: { "category": "canva", "slug": "my-design" }
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import matter from "gray-matter";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ContentCategory = "canva";

interface DriveRequest {
  category: ContentCategory;
  slug: string;
}

interface ParsedMdx {
  slug: string;
  content: string;
  metadata: {
    title: string;
    summary: string;
    publishedAt: string;
    image?: string;
    images?: string[];
    team?: Array<{ name: string; role: string; avatar: string }>;
    [key: string]: unknown;
  };
}

interface MdxResponse {
  posts: ParsedMdx[];
}

interface ErrorResponse {
  error: string;
  code?: string;
  message?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE DRIVE AUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getServiceAccountCredentials() {
  // Try JSON directly first
  const jsonCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonCreds) {
    try {
      return JSON.parse(jsonCreds);
    } catch {
      // Not valid JSON, continue
    }
  }

  // Try Base64 encoded
  const base64Creds = process.env.GOOGLE_SA_BASE64;
  if (base64Creds) {
    try {
      const decoded = Buffer.from(base64Creds, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
      throw new Error("Failed to decode GOOGLE_SA_BASE64");
    }
  }

  throw new Error(
    "No Google Service Account credentials found. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SA_BASE64"
  );
}

async function getDriveClient() {
  const credentials = getServiceAccountCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FOLDER ID MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFolderId(category: ContentCategory): string {
  const envVars: Record<ContentCategory, string> = {
    canva: "DRIVE_CANVA_FOLDER_ID",
  };

  const folderId = process.env[envVars[category]];
  if (!folderId) {
    throw new Error(`${envVars[category]} environment variable not set`);
  }
  return folderId;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRIVE OPERATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function findSubfolderBySlug(
  drive: ReturnType<typeof google.drive>,
  parentFolderId: string,
  slug: string
): Promise<string | null> {
  const response = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${slug}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 1,
  });

  return response.data.files?.[0]?.id || null;
}

async function findIndexMdx(
  drive: ReturnType<typeof google.drive>,
  folderId: string
): Promise<string | null> {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and name = 'index.mdx' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 1,
  });

  return response.data.files?.[0]?.id || null;
}

async function getFileContent(
  drive: ReturnType<typeof google.drive>,
  fileId: string
): Promise<string> {
  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "text" }
  );

  return response.data as string;
}

async function listImagesInFolder(
  drive: ReturnType<typeof google.drive>,
  folderId: string
): Promise<string[]> {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
    fields: "files(id, name)",
    pageSize: 50,
  });

  // Convert to public URLs
  return (
    response.data.files?.map(
      (file) => `https://drive.google.com/uc?export=view&id=${file.id}`
    ) || []
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MDX PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseMdxContent(
  slug: string,
  content: string,
  images: string[]
): ParsedMdx {
  const { data: frontmatter, content: mdxContent } = matter(content);

  // Resolve relative image paths in frontmatter
  let resolvedImage = frontmatter.image;
  if (resolvedImage && !resolvedImage.startsWith("http") && images.length > 0) {
    // Find matching image by name
    const imageName = resolvedImage.replace(/^\.\//, "");
    const matchingImage = images.find((url) =>
      url.toLowerCase().includes(imageName.toLowerCase())
    );
    resolvedImage = matchingImage || images[0];
  }

  return {
    slug,
    content: mdxContent,
    metadata: {
      title: frontmatter.title || slug,
      summary: frontmatter.summary || frontmatter.description || "",
      publishedAt: frontmatter.publishedAt || frontmatter.date || new Date().toISOString(),
      image: resolvedImage,
      images: images.length > 0 ? images : frontmatter.images,
      team: frontmatter.team,
      ...frontmatter,
    },
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DriveRequest;
    const { category, slug } = body;

    if (!category || !slug) {
      return NextResponse.json(
        { error: "Missing category or slug" } as ErrorResponse,
        { status: 400 }
      );
    }

    // Get folder ID for category
    let parentFolderId: string;
    try {
      parentFolderId = getFolderId(category);
    } catch (error) {
      return NextResponse.json(
        { error: String(error), code: "CONFIG_ERROR" } as ErrorResponse,
        { status: 500 }
      );
    }

    // Get Drive client
    const drive = await getDriveClient();

    // Step 1: Find subfolder by slug
    const subfolderId = await findSubfolderBySlug(drive, parentFolderId, slug);
    if (!subfolderId) {
      return NextResponse.json(
        {
          error: `Folder '${slug}' not found in ${category}`,
          code: "FOLDER_NOT_FOUND",
        } as ErrorResponse,
        { status: 404 }
      );
    }

    // Step 2: Find index.mdx in subfolder
    const indexFileId = await findIndexMdx(drive, subfolderId);
    if (!indexFileId) {
      return NextResponse.json(
        {
          error: `index.mdx not found in ${slug} folder`,
          code: "INDEX_NOT_FOUND",
        } as ErrorResponse,
        { status: 404 }
      );
    }

    // Step 3: Get file content and images
    const [content, images] = await Promise.all([
      getFileContent(drive, indexFileId),
      listImagesInFolder(drive, subfolderId),
    ]);

    // Step 4: Parse MDX
    const parsed = parseMdxContent(slug, content, images);

    const response: MdxResponse = {
      posts: [parsed],
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("MDX Parse error:", error);
    return NextResponse.json(
      { error: `Failed to fetch content: ${error}` } as ErrorResponse,
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "mdx-parse" });
}
