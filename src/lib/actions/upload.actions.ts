"use server";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteUploadThingFile(url: string) {
  try {
    const fileKey = url.split("/").pop();
    if (!fileKey) return { success: false };

    await utapi.deleteFiles(fileKey);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false };
  }
}
