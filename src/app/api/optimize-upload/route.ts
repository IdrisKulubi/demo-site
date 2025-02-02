import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();
const utapi = new UTApi();


// Regular uploadthing router for initial uploads
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

// Separate POST handler for optimized image uploads
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload directly using UTApi
    const uploadResponse = await utapi.uploadFiles(file);

    if (!uploadResponse?.data?.url) {
      throw new Error("Upload failed");
    }

    return NextResponse.json({ url: uploadResponse.data.url });
  } catch (error) {
    console.error("Optimization upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload optimized image" },
      { status: 500 }
    );
  }
}

export type OurFileRouter = typeof ourFileRouter;
