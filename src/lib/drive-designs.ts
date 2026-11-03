/**
 * Lists the design images shown on /designs from Google Drive.
 *
 * Runs on the server only: the service account credentials never reach the
 * browser. Results are cached for an hour so a page view doesn't trigger a
 * fresh round of Drive API calls.
 *
 * Structure: [DRIVE_CANVA_FOLDER_ID] / [Top folder] / [Sub folder] / images
 */
import "server-only";

import { google } from "googleapis";
import { unstable_cache } from "next/cache";

export interface DesignImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export interface DesignCategory {
  name: string;
  slug: string;
  images: DesignImage[];
}

export type DesignsResult =
  | { status: "ok"; categories: DesignCategory[] }
  | { status: "not-configured" }
  | { status: "error" };

// Drive file IDs are URL-safe base64-ish strings. Anything else is dropped so
// it can't be interpolated into a query or a URL.
const DRIVE_ID = /^[A-Za-z0-9_-]{10,100}$/;

function getServiceAccountCredentials() {
  const jsonCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonCreds) {
    return JSON.parse(jsonCreds);
  }

  const base64Creds = process.env.GOOGLE_SA_BASE64;
  if (base64Creds) {
    return JSON.parse(Buffer.from(base64Creds, "base64").toString("utf-8"));
  }

  return null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function listDesigns(): Promise<DesignsResult> {
  const folderId = process.env.DRIVE_CANVA_FOLDER_ID;
  const credentials = getServiceAccountCredentials();
  if (!folderId || !DRIVE_ID.test(folderId) || !credentials) {
    return { status: "not-configured" };
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth });

  const listFolders = async (parentId: string) =>
    (
      await drive.files.list({
        q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name)",
        pageSize: 100,
        orderBy: "name",
      })
    ).data.files ?? [];

  const listImages = async (parentId: string): Promise<DesignImage[]> =>
    (
      (
        await drive.files.list({
          q: `'${parentId}' in parents and mimeType contains 'image/' and trashed = false`,
          fields: "files(id, name)",
          pageSize: 100,
          orderBy: "name",
        })
      ).data.files ?? []
    )
      .filter((file) => file.id && DRIVE_ID.test(file.id))
      .map((file) => ({
        id: file.id as string,
        name: (file.name || "design").slice(0, 120),
        url: `https://drive.google.com/uc?export=download&id=${file.id}`,
        thumbnail: `https://drive.google.com/thumbnail?id=${file.id}&sz=w600`,
      }));

  const categories: DesignCategory[] = [];
  for (const topFolder of await listFolders(folderId)) {
    if (!topFolder.id || !topFolder.name || !DRIVE_ID.test(topFolder.id)) continue;

    const [subFolders, directImages] = await Promise.all([
      listFolders(topFolder.id),
      listImages(topFolder.id),
    ]);

    const subCategories = await Promise.all(
      subFolders
        .filter((sub) => sub.id && sub.name && DRIVE_ID.test(sub.id))
        .map(async (sub) => ({
          name: `${topFolder.name}/${sub.name}`,
          slug: slugify(`${topFolder.name}/${sub.name}`),
          images: await listImages(sub.id as string),
        })),
    );

    categories.push(...subCategories.filter((category) => category.images.length > 0));
    if (directImages.length > 0) {
      categories.push({ name: topFolder.name, slug: slugify(topFolder.name), images: directImages });
    }
  }

  categories.sort((a, b) => a.name.localeCompare(b.name));
  return { status: "ok", categories };
}

const cachedListDesigns = unstable_cache(listDesigns, ["drive-designs"], {
  revalidate: 3600,
});

export async function getDesigns(): Promise<DesignsResult> {
  try {
    return await cachedListDesigns();
  } catch (error) {
    // Log the detail server-side only; the page shows a generic message.
    console.error("Failed to list designs from Google Drive:", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}
