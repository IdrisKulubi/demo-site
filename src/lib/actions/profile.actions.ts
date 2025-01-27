/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import db from "@/db/drizzle";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deleteUploadThingFile } from "./upload.actions";
import { z } from "zod";
import { profileSchema } from "../validators";

export type ProfileFormData = z.infer<typeof profileSchema> & {
  firstName: string;
  lastName: string;
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
  phoneNumber?: string;
};

export async function getProfile() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.error("No user email in session");
      return null;
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      console.error("User not found by email:", session.user.email);
      throw new Error("User not found"); // Prevent profile creation for non-existent user
    }

    const actualUserId = user[0].id;

    // Check for existing profile
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, actualUserId))
      .limit(1);

    if (existingProfile?.[0]) {
      return existingProfile[0];
    }

    // Only create profile if user exists
    console.log("Creating profile for verified user:", actualUserId);
    const newProfile = await db
      .insert(profiles)
      .values({
        userId: actualUserId,
        profileCompleted: false,
        updatedAt: new Date(),
      })
      .returning();

    return newProfile[0];
  } catch (error) {
    console.error("Error in getProfile:", error);
    throw error; // Rethrow to handle in calling functions
  }
}

export async function updateProfile(data: ProfileFormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      return { success: false, error: "User not found" };
    }

    const actualUserId = user[0].id;

    // Transform social fields before validation
    const processedData = {
      ...data,
      instagram: data.instagram ?? "",
      spotify: data.spotify ?? "",
      snapchat: data.snapchat ?? "",
    };

    // Validate the processed data
    const validatedData = await profileSchema.safeParseAsync(processedData);
    if (!validatedData.success) {
      console.error("Validation errors:", validatedData.error);
      return {
        success: false,
        error: "Invalid profile data",
      };
    }

    // Update the profile using validated data
    const updatedProfile = await db
      .update(profiles)
      .set({
        firstName: processedData.firstName,
        lastName: processedData.lastName,
        phoneNumber: processedData.phoneNumber,
        bio: processedData.bio,
        interests: processedData.interests,
        lookingFor: processedData.lookingFor,
        course: processedData.course,
        yearOfStudy: processedData.yearOfStudy,
        instagram: processedData.instagram,
        spotify: processedData.spotify,
        snapchat: processedData.snapchat,
        gender: processedData.gender,
        age: processedData.age,
        photos: processedData.photos,
        profilePhoto: processedData.profilePhoto,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, actualUserId))
      .returning();

    if (!updatedProfile || updatedProfile.length === 0) {
      return {
        success: false,
        error: "Failed to update profile",
      };
    }

    revalidatePath("/profile");
    return {
      success: true,
      profile: updatedProfile[0],
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again!",
    };
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
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        photos: data.photos,
        bio: data.bio,
        interests: data.interests,
        lookingFor: data.lookingFor,
        course: data.course,
        yearOfStudy: data.yearOfStudy,
        instagram: data.instagram || "",
        spotify: data.spotify || "",
        snapchat: data.snapchat || "",
        gender: data.gender,
        age: data.age,
        profilePhoto: data.profilePhoto,
        updatedAt: new Date(),
        profileCompleted: true,
      })
      .where(eq(profiles.userId, session.user.id));

    revalidatePath("/explore");
    revalidatePath("/explore");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again 😢",
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
      error: "Failed to update profile photo. Please try again 😢",
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

    const profile = await getProfile();
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
        error: "You must keep at least one photo 📸",
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
      error: "Failed to remove photo. Please try again😢",
    };
  }
}
