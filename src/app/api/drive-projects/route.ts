/**
 * Drive Projects List API - Lists all projects from Google Drive
 *
 * GET /api/drive-projects
 * Returns: { projects: [{ slug, title, summary, image, publishedAt }] }
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";
import matter from "gray-matter";

interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  image?: string;
  publishedAt: string;
  images?: string[];
  team?: Array<{ name: string; avatar: string }>;
}

function getServiceAccountCredentials() {
  const jsonCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonCreds) {
    try {
      return JSON.parse(jsonCreds);
    } catch {
      // Not valid JSON
    }
  }

  const base64Creds = process.env.GOOGLE_SA_BASE64;
  if (base64Creds) {
    try {
      const decoded = Buffer.from(base64Creds, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
      throw new Error("Failed to decode GOOGLE_SA_BASE64");
    }
  }

  throw new Error("No Google Service Account credentials found");
}

async function getDriveClient() {
  const credentials = getServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

export async function GET() {
  try {
    const folderId = process.env.DRIVE_PROJECTS_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { error: "DRIVE_PROJECTS_FOLDER_ID not set" },
        { status: 500 }
      );
    }

    const drive = await getDriveClient();

    // List all subfolders (each is a project)
    const foldersResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
      pageSize: 100,
    });

    const folders = foldersResponse.data.files || [];
    const projects: ProjectSummary[] = [];

    // Fetch each project's index.mdx
    for (const folder of folders) {
      if (!folder.id || !folder.name) continue;

      try {
        // Find index.mdx
        const indexResponse = await drive.files.list({
          q: `'${folder.id}' in parents and name = 'index.mdx' and trashed = false`,
          fields: "files(id)",
          pageSize: 1,
        });

        const indexFile = indexResponse.data.files?.[0];
        if (!indexFile?.id) continue;

        // Get content
        const contentResponse = await drive.files.get(
          { fileId: indexFile.id, alt: "media" },
          { responseType: "text" }
        );

        const content = contentResponse.data as string;
        const { data: frontmatter } = matter(content);

        // Get images from folder
        const imagesResponse = await drive.files.list({
          q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed = false`,
          fields: "files(id, name)",
          pageSize: 10,
        });

        const images = imagesResponse.data.files?.map(
          (f) => `https://drive.google.com/uc?export=view&id=${f.id}`
        ) || [];

        projects.push({
          slug: folder.name,
          title: frontmatter.title || folder.name,
          summary: frontmatter.summary || frontmatter.description || "",
          publishedAt: frontmatter.publishedAt || frontmatter.date || new Date().toISOString(),
          image: images[0],
          images,
          team: frontmatter.team,
        });
      } catch (err) {
        console.error(`Error processing project ${folder.name}:`, err);
      }
    }

    // Sort by publishedAt descending
    projects.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Drive projects list error:", error);
    return NextResponse.json(
      { error: `Failed to list projects: ${error}` },
      { status: 500 }
    );
  }
}
