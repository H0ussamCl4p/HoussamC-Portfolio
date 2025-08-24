// Run this script with: node sync-designs.js
// It will download all images from your Google Drive folder (and subfolders) into public/designs

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const KEYFILEPATH = path.join(process.cwd(), 'google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const FOLDER_ID = '18N9Fdzz962KQ7V5JOeD1-0rZbQnhUM4o'; // <-- Replace with your folder ID
const DEST_DIR = path.join(process.cwd(), 'public', 'designs');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadFile(drive, file, destPath) {
  const dest = fs.createWriteStream(destPath);
  const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    res.data
      .on('end', resolve)
      .on('error', reject)
      .pipe(dest);
  });
}

async function getImagesRecursive(drive, folderId, currentPath) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
  });
  const files = res.data.files || [];

  for (const file of files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      const subfolderPath = path.join(currentPath, file.name);
      await ensureDir(subfolderPath);
      await getImagesRecursive(drive, file.id, subfolderPath);
    } else if (file.mimeType.startsWith('image/')) {
      const destPath = path.join(currentPath, file.name);
      console.log(`Downloading ${file.name} to ${destPath}`);
      await downloadFile(drive, file, destPath);
    }
  }
}

async function main() {
  await ensureDir(DEST_DIR);
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  const drive = google.drive({ version: 'v3', auth });
  await getImagesRecursive(drive, FOLDER_ID, DEST_DIR);
  console.log('All images downloaded!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
