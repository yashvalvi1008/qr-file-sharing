import { nanoid } from "nanoid";
import QRCode from "qrcode";

import { env } from "../config/env.js";
import { FileModel } from "../models/File.js";
import { putObject, resolveStorageProvider } from "../services/storageService.js";

function safeFilename(name) {
  const base = name.replace(/[^\w.\-() ]+/g, "_");
  return base.slice(0, 180) || "file";
}

export async function uploadController(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "NoFile", message: "No file uploaded." });
  }

  const id = nanoid(21);
  const originalName = safeFilename(file.originalname ?? "file");
  const s3Key = `${id}/${originalName}`;

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + env.FILE_TTL_HOURS * 60 * 60 * 1000);

  const storageProvider = resolveStorageProvider();
  const stored = await putObject({
    key: s3Key,
    buffer: file.buffer,
    contentType: file.mimetype || "application/octet-stream"
  });

  await FileModel.create({
    _id: id,
    originalName,
    mimeType: file.mimetype || "application/octet-stream",
    size: file.size,
    storageProvider,
    bucket: stored.bucket,
    s3Key: stored.s3Key,
    localPath: stored.localPath,
    downloads: 0,
    expiresAt
  });

  const downloadPageUrl = `${env.APP_BASE_URL}/download.html?id=${encodeURIComponent(id)}`;
  const qrDataUrl = await QRCode.toDataURL(downloadPageUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  return res.status(201).json({
    id,
    originalName,
    size: file.size,
    mimeType: file.mimetype,
    expiresAt: expiresAt.toISOString(),
    downloadPageUrl,
    qrDataUrl
  });
}

