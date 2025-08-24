import { google } from 'googleapis';
import path from 'node:path';
import { promises as fs } from 'fs';

const KEYFILEPATH = path.join(process.cwd(), 'google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const FOLDER_ID = '18N9Fdzz962KQ7V5JOeD1-0rZbQnhUM4o'; // <-- Replace with your folder ID

async function getImagesRecursive(drive, folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, thumbnailLink)',
  });
  const files = res.data.files || [];

  const images = files
    .filter(file => file.mimeType?.startsWith('image/'))
    .map(file => ({
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/uc?export=view&id=${file.id}`,
      thumbnail: file.thumbnailLink,
    }));

  const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');

  for (const folder of folders) {
    const subImages = await getImagesRecursive(drive, folder.id);
    images.push(...subImages);
  }

  return images;
}

export async function GET(req) {
  try {
    // Ensure the key file exists
    await fs.access(KEYFILEPATH);
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
    const drive = google.drive({ version: 'v3', auth });
    const images = await getImagesRecursive(drive, FOLDER_ID);
    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
