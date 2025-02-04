import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Move this to a function to prevent client-side execution
function getS3Client() {
  // Validate required environment variables
  if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
    throw new Error("CLOUDFLARE_R2_ENDPOINT is not configured");
  }
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID is not configured");
  }
  if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new Error("CLOUDFLARE_R2_SECRET_ACCESS_KEY is not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });
}

export const generatePresignedUrl = async (fileName: string) => {
  try {
    if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not configured");
    }

    const s3 = getS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      ContentType: "image/webp",
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    throw error;
  }
};

export const deleteR2File = async (fileUrl: string) => {
  try {
    if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      throw new Error("CLOUDFLARE_R2_PUBLIC_URL is not configured");
    }
    if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not configured");
    }

    // Update to handle both old and new URLs
    const isOldUrl = fileUrl.includes(
      "pub-fd999fa4db5f45aea35c41c909f365ca.r2.dev"
    );
    const isCdnUrl = fileUrl.includes("cdn.strathspace.com");

    if (!isOldUrl && !isCdnUrl) {
      throw new Error("Invalid R2 file URL");
    }

    const url = new URL(fileUrl);
    const fileKey = url.pathname.slice(1); // Remove leading slash
    const s3 = getS3Client();

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileKey,
      })
    );
  } catch (error) {
    console.error("Failed to delete R2 file:", error);
    throw error;
  }
};
