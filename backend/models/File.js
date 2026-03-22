import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageProvider: { type: String, required: true, enum: ["s3", "local"] },
    bucket: { type: String },
    s3Key: { type: String },
    localPath: { type: String },
    downloads: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

FileSchema.index({ expiresAt: 1 });

export const FileModel = mongoose.model("File", FileSchema);

