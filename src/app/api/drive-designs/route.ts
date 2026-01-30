/**
 * Drive Designs API - Lists Canva designs from Google Drive
 *
 * Structure: Canva / [Category-Folder] / images...
 * No index.mdx required - just folders with images
 *
 * GET /api/drive-designs
 * Returns: { categories: [{ name, slug, images: [{id, name, url, thumbnail}], thumbnail }] }
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";

interface DesignImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

interface DesignCategory {
  name: string;
  slug: string;
  images: DesignImage[];
  thumbnail: string | null;
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const folderId = process.env.DRIVE_CANVA_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { error: "DRIVE_CANVA_FOLDER_ID not set" },
        { status: 500 }
      );
    }

    const drive = await getDriveClient();

    // List all subfolders in Canva folder (each is a design category)
    const foldersResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
      pageSize: 100,
      orderBy: "name",
    });

    const folders = foldersResponse.data.files || [];
    const categories: DesignCategory[] = [];

    // Fetch images for each category folder
    for (const folder of folders) {
      if (!folder.id || !folder.name) continue;

      try {
        // Get all images in this folder
        const imagesResponse = await drive.files.list({
          q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed = false`,
          fields: "files(id, name, mimeType)",
          pageSize: 100,
          orderBy: "name",
        });

        const images: DesignImage[] = (imagesResponse.data.files || []).map(
          (file) => ({
            id: file.id || "",
            name: file.name || "design",
            url: `https://drive.google.com/uc?export=download&id=${file.id}`,
            thumbnail: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
          })
        );

        if (images.length > 0) {
          categories.push({
            name: folder.name,
            slug: slugify(folder.name),
            images,
            thumbnail: images[0]?.thumbnail || null,
          });
        }
      } catch (err) {
        console.error(`Error processing Canva folder ${folder.name}:`, err);
      }
    }

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Drive designs list error:", error);
    return NextResponse.json(
      { error: `Failed to list designs: ${error}` },
      { status: 500 }
    );
  }
}
