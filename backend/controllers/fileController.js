import { FileModel } from "../models/File.js";
import { env } from "../config/env.js";

export async function fileController(req, res) {
  const { id } = req.params;
  const doc = await FileModel.findById(id).lean();
  if (!doc) return res.status(404).json({ error: "NotFound", message: "File not found." });

  const now = new Date();
  if (doc.expiresAt <= now) {
    return res.status(410).json({ error: "FileExpired", message: "This file has expired." });
  }

  const downloadUrl = `${env.APP_BASE_URL}/api/download/${encodeURIComponent(doc._id)}`;

  res.json({
    id: doc._id,
    originalName: doc.originalName,
    size: doc.size,
    mimeType: doc.mimeType,
    downloads: doc.downloads,
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString(),
    downloadUrl
  });
}

