import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Log all R2-related environment variables (excluding secret values)
    const config = {
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      publicUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL,
    };

    return NextResponse.json({ 
      status: "ok", 
      config: {
        ...config,
        accessKey: config.hasAccessKey ? "✓ Present" : "✗ Missing",
        secretKey: config.hasSecretKey ? "✓ Present" : "✗ Missing",
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 