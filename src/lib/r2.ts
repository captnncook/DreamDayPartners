import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "dreamday-files";

// Sommige velden (bijv. door bulk-import) bevatten al een volledige externe
// URL in plaats van een R2-object-key — die hoeft niet gesigned te worden.
export async function getDownloadUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
  if (/^https?:\/\//i.test(fileKey)) return fileKey;
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: fileKey }), {
    expiresIn: expiresInSeconds,
  });
}

export async function deleteFile(fileKey: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: fileKey }));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
