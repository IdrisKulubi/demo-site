"use server";

import db from "@/db/drizzle";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { profileSchema } from "@/lib/validators";
import { deleteUploadThingFile } from "./upload.actions";

export interface ProfileFormData {
  photos: string[];
  bio: string;
  interests: string[];
  lookingFor: "friends" | "dating" | "both";
  course: string;
  yearOfStudy: number;
  instagram?: string;
  spotify?: string;
  snapchat?: string;
  gender: "male" | "female" | "non-binary" | "other";
  age: number;
  profilePhoto?: string;
}

export async function updateProfile(data: ProfileFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Uh oh! Not logged in 😅 Please log in to continue",
      };
    }

    await db
      .update(profiles)
      .set({
        userId: session.user.id,
        photos: data.photos,
        bio: data.bio,
        interests: data.interests,
        lookingFor: data.lookingFor,
        course: data.course,
        yearOfStudy: data.yearOfStudy,
        instagram: data.instagram || null,
        spotify: data.spotify || null,
        snapchat: data.snapchat || null,
        gender: data.gender,
        age: data.age,
        profileCompleted: true,
      })
      .where(eq(profiles.userId, session.user.id));

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again! 😅",
    };
  }
}

export async function getProfile(userId: string) {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });
    console.log("Found profile:", profile ? "Yes" : "No", profile);
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function submitProfile(data: ProfileFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .update(profiles)
      .set({
        userId: session.user.id,
        photos: data.photos,
        bio: data.bio,
        interests: data.interests,
        lookingFor: data.lookingFor,
        course: data.course,
        yearOfStudy: data.yearOfStudy,
        instagram: data.instagram || null,
        spotify: data.spotify || null,
        snapchat: data.snapchat || null,
        gender: data.gender,
        age: data.age,
        profileCompleted: true,
      })
      .where(eq(profiles.userId, session.user.id));

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again! 😅",
    };
  }
}

export async function updateProfileField(
  field: keyof Omit<ProfileFormData, "profilePhoto">,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate the field
    const validatedData = await profileSchema.shape[field].parseAsync(value);

    await db
      .update(profiles)
      .set({ [field]: validatedData })
      .where(eq(profiles.userId, session.user.id));

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    return {
      success: false,
      error: `Failed to update ${field}. Please try again! 😅`,
    };
  }
}

export async function updateProfilePhoto(photoUrl: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    await db
      .update(profiles)
      .set({ profilePhoto: photoUrl })
      .where(eq(profiles.userId, session.user.id));

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile photo:", error);
    return {
      success: false,
      error: "Failed to update profile photo. Please try again! 😅",
    };
  }
}

export async function removePhoto(photoUrl: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const profile = await getProfile(session.user.id);
    if (!profile) {
      return {
        success: false,
        error: "Profile not found",
      };
    }

    // Ensure at least one photo remains
    if (profile.photos && profile.photos.length <= 1) {
      return {
        success: false,
        error: "You must keep at least one photo! 📸",
      };
    }

    const updatedPhotos = profile.photos?.filter((p) => p !== photoUrl);
    await db
      .update(profiles)
      .set({ photos: updatedPhotos })
      .where(eq(profiles.userId, session.user.id));

    // Delete the photo from storage
    await deleteUploadThingFile(photoUrl);

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error removing photo:", error);
    return {
      success: false,
      error: "Failed to remove photo. Please try again! 😅",
    };
  }
}
