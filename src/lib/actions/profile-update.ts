"use server";

import { auth } from "@/auth";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteUploadThingFile } from "@/lib/actions/upload.actions";
import db from "@/db/drizzle";

export async function deleteAllUserPhotos() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user's profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
      columns: {
        photos: true,
        profilePhoto: true,
      },
    });

    if (!userProfile) {
      return { success: false, error: "Profile not found" };
    }

    // Collect all photos to delete
    const allPhotos = [
      ...(userProfile.photos || []),
      userProfile.profilePhoto ? [userProfile.profilePhoto] : [],
    ].filter(Boolean);

    // Delete photos from storage (only UploadThing files)
    await Promise.all(
      allPhotos.map(async (url) => {
        try {
          // Only delete UploadThing files, skip R2 files
          if (url.includes("utfs.io") || url.includes("uploadthing")) {
            await deleteUploadThingFile(url as string);
          }
        } catch (error) {
          console.error("Error deleting photo:", url, error);
        }
      })
    );

    // Update profile in database
    await db
      .update(profiles)
      .set({
        photos: [],
        profilePhoto: null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user photos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete photos",
    };
  }
}
