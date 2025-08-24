#!/usr/bin/env node
// Combined script: sync-and-generate.js
// Usage: node sync-and-generate.js
// It will (optionally) sync images from Google Drive into public/designs
// and then generate public/designs.json manifest.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'public', 'designs');
const OUTFILE = path.join(process.cwd(), 'public', 'designs.json');
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (IMAGE_EXTS.includes(path.extname(file).toLowerCase())) {
      results.push(path.relative(ROOT, filePath).replace(/\\/g, '/'));
    }
  }
  return results;
}

function writeManifest() {
  const images = walk(ROOT);
  fs.writeFileSync(OUTFILE, JSON.stringify(images, null, 2));
  console.log(`Wrote ${images.length} images to ${OUTFILE}`);
}

async function maybeSyncFromDrive() {
  // Only run sync if google-service-account.json exists and FOLDER_ID env is set
  const keyfile = path.join(process.cwd(), 'google-service-account.json');
  const folderId = process.env.GDRIVE_FOLDER_ID || process.env.FOLDER_ID || '';
  if (!fs.existsSync(keyfile) || !folderId) {
    console.log('Skipping Google Drive sync: missing service account or folder id.');
    return;
  }

  console.log('Starting Google Drive sync...');
  const { google } = require('googleapis');
  const { drive } = google;
  const KEYFILEPATH = keyfile;
  const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

  const DEST_DIR = ROOT;
  await ensureDir(DEST_DIR);

  const auth = new google.auth.GoogleAuth({ keyFile: KEYFILEPATH, scopes: SCOPES });
  const client = await auth.getClient();
  const driveClient = google.drive({ version: 'v3', auth: client });

  async function downloadFile(file, destPath) {
    const dest = fs.createWriteStream(destPath);
    const res = await driveClient.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
      res.data.on('end', resolve).on('error', reject).pipe(dest);
    });
  }

  async function getImagesRecursive(folderId, currentPath) {
    const res = await driveClient.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
    });
    const files = res.data.files || [];
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        const subfolderPath = path.join(currentPath, file.name);
        await ensureDir(subfolderPath);
        await getImagesRecursive(file.id, subfolderPath);
      } else if (file.mimeType && file.mimeType.startsWith('image/')) {
        const destPath = path.join(currentPath, file.name);
        console.log(`Downloading ${file.name} -> ${destPath}`);
        await downloadFile(file, destPath);
      }
    }
  }

  await getImagesRecursive(folderId, DEST_DIR);
  console.log('Google Drive sync complete.');
}

async function main() {
  await ensureDir(ROOT);
  await maybeSyncFromDrive();
  writeManifest();
}

main().catch((err) => {
  console.error('Error:', err && err.message ? err.message : err);
  process.exit(1);
});
