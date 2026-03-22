import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

export async function uploadToS3({ bucket, key, body, contentType }) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    }
  });

  await upload.done();
}

export async function getObjectStream({ bucket, key }) {
  const out = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );
  return out.Body;
}

export async function deleteFromS3({ bucket, key }) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );
}

