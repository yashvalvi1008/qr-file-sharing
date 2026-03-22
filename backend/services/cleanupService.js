import { FileModel } from "../models/File.js";
import { deleteObject } from "./storageService.js";

export async function cleanupExpiredFiles({ limit = 25 } = {}) {
  const now = new Date();
  const expired = await FileModel.find({ expiresAt: { $lte: now } }).limit(limit);
  if (expired.length === 0) return { deleted: 0 };

  for (const f of expired) {
    try {
      await deleteObject({
        provider: f.storageProvider,
        bucket: f.bucket,
        s3Key: f.s3Key,
        localPath: f.localPath
      });
    } catch {
      // If object is already gone, we still want metadata removed.
    }
    await FileModel.deleteOne({ _id: f._id });
  }

  return { deleted: expired.length };
}

