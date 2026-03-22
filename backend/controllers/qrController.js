import QRCode from "qrcode";
import { env } from "../config/env.js";
import { FileModel } from "../models/File.js";

export async function qrController(req, res) {
  const { id } = req.params;
  const doc = await FileModel.findById(id).lean();
  if (!doc) return res.status(404).json({ error: "NotFound", message: "File not found." });

  const now = new Date();
  if (doc.expiresAt <= now) {
    return res.status(410).json({ error: "FileExpired", message: "This file has expired." });
  }

  const downloadPageUrl = `${env.APP_BASE_URL}/download.html?id=${encodeURIComponent(id)}`;
  const png = await QRCode.toBuffer(downloadPageUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store");
  res.send(png);
}

