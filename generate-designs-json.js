// Run this script with: node generate-designs-json.js
// It will scan public/designs and output public/designs.json with all image paths

const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'public', 'designs');
const OUTFILE = path.join(process.cwd(), 'public', 'designs.json');
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

function walk(dir) {
  let results = [];
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

function main() {
  const images = walk(ROOT);
  fs.writeFileSync(OUTFILE, JSON.stringify(images, null, 2));
  console.log(`Wrote ${images.length} images to public/designs.json`);
}

main();
