import { env } from "../config/env.js";
import { uploadToS3, getObjectStream as getS3Stream, deleteFromS3 } from "./s3Service.js";
import { uploadToLocal, getLocalReadStream, deleteFromLocal } from "./localStorageService.js";

export function resolveStorageProvider() {
  if (env.STORAGE_PROVIDER === "s3") return "s3";
  if (env.STORAGE_PROVIDER === "local") return "local";

  const hasAws =
    !!env.AWS_REGION && !!env.AWS_ACCESS_KEY_ID && !!env.AWS_SECRET_ACCESS_KEY && !!env.S3_BUCKET_NAME;
  return hasAws ? "s3" : "local";
}

export async function putObject({ key, buffer, contentType }) {
  const provider = resolveStorageProvider();

  if (provider === "s3") {
    await uploadToS3({
      bucket: env.S3_BUCKET_NAME,
      key,
      body: buffer,
      contentType
    });
    return { provider, bucket: env.S3_BUCKET_NAME, s3Key: key };
  }

  const localPath = await uploadToLocal({ key, buffer });
  return { provider, localPath };
}

export async function getObjectStream({ provider, bucket, s3Key, localPath }) {
  if (provider === "s3") {
    return await getS3Stream({ bucket, key: s3Key });
  }
  return getLocalReadStream({ fullPath: localPath });
}

export async function deleteObject({ provider, bucket, s3Key, localPath }) {
  if (provider === "s3") {
    await deleteFromS3({ bucket, key: s3Key });
    return;
  }
  await deleteFromLocal({ fullPath: localPath });
}

