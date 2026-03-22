import { FileModel } from "../models/File.js";
import { getObjectStream } from "../services/storageService.js";

function contentDisposition(filename) {
  const safe = filename.replace(/["\\]/g, "_");
  return `attachment; filename="${safe}"`;
}

export async function downloadController(req, res) {
  const { id } = req.params;
  const doc = await FileModel.findById(id);
  if (!doc) return res.status(404).json({ error: "NotFound", message: "File not found." });

  const now = new Date();
  if (doc.expiresAt <= now) {
    return res.status(410).json({ error: "FileExpired", message: "This file has expired." });
  }

  await FileModel.updateOne({ _id: doc._id }, { $inc: { downloads: 1 } });

  const stream = await getObjectStream({
    provider: doc.storageProvider,
    bucket: doc.bucket,
    s3Key: doc.s3Key,
    localPath: doc.localPath
  });
  if (!stream) return res.status(500).json({ error: "S3Error", message: "Unable to read file." });

  res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
  res.setHeader("Content-Length", String(doc.size));
  res.setHeader("Content-Disposition", contentDisposition(doc.originalName));

  stream.on("error", () => {
    if (!res.headersSent) res.status(500);
    res.end();
  });

  stream.pipe(res);
}

