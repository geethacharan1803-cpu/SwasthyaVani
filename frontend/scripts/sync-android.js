// Script to sync built frontend assets into the Android native wrapper
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const androidAssetsDir = path.resolve(__dirname, '..', '..', 'android', 'app', 'src', 'main', 'assets', 'public');

if (!fs.existsSync(distDir)) {
  console.error('[ERROR] dist directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// Clean and recreate destination
if (fs.existsSync(androidAssetsDir)) {
  fs.rmSync(androidAssetsDir, { recursive: true, force: true });
}
fs.mkdirSync(androidAssetsDir, { recursive: true });

// Copy all files recursively
fs.cpSync(distDir, androidAssetsDir, { recursive: true });
console.log(`[SYNC] Successfully synchronized built web assets from ${distDir} to ${androidAssetsDir}`);

