import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

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
