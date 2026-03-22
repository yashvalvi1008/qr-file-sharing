import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root-level uploads/ as requested in the project spec.
const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");

export async function ensureUploadsDir() {
  await fsp.mkdir(uploadsDir, { recursive: true });
}

export function localObjectPath(key) {
  // key is like: `${id}/${filename}`
  return path.join(uploadsDir, key);
}

export async function uploadToLocal({ key, buffer }) {
  await ensureUploadsDir();
  const fullPath = localObjectPath(key);
  await fsp.mkdir(path.dirname(fullPath), { recursive: true });
  await fsp.writeFile(fullPath, buffer);
  return fullPath;
}

export function getLocalReadStream({ fullPath }) {
  return fs.createReadStream(fullPath);
}

export async function deleteFromLocal({ fullPath }) {
  try {
    await fsp.unlink(fullPath);
  } catch {
    // ignore
  }
}

