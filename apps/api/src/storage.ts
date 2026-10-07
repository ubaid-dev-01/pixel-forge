import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import type { ApiEnv } from "./env.js";

export function createS3(env: ApiEnv): S3Client {
  return new S3Client({
    region: env.OBJECT_STORAGE_REGION,
    endpoint: env.OBJECT_STORAGE_ENDPOINT,
    forcePathStyle: env.OBJECT_STORAGE_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.OBJECT_STORAGE_ACCESS_KEY,
      secretAccessKey: env.OBJECT_STORAGE_SECRET_KEY,
    },
  });
}

export function objectKey(userId: string, kind: "image" | "video", ext: string): string {
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase();
  return `u/${userId}/${kind}/${randomUUID()}.${safeExt || "bin"}`;
}

export async function presignPut(
  client: S3Client,
  env: ApiEnv,
  key: string,
  mime: string,
): Promise<string> {
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: env.OBJECT_STORAGE_BUCKET,
      Key: key,
      ContentType: mime,
    }),
    { expiresIn: env.SIGNED_UPLOAD_TTL_SECONDS },
  );
}

export async function presignGet(client: S3Client, env: ApiEnv, key: string): Promise<string> {
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: env.OBJECT_STORAGE_BUCKET,
      Key: key,
    }),
    { expiresIn: env.SIGNED_DOWNLOAD_TTL_SECONDS },
  );
}

export async function deleteObject(client: S3Client, env: ApiEnv, key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.OBJECT_STORAGE_BUCKET,
      Key: key,
    }),
  );
}

export async function assertBucket(client: S3Client, env: ApiEnv): Promise<void> {
  await client.send(new HeadBucketCommand({ Bucket: env.OBJECT_STORAGE_BUCKET }));
}
