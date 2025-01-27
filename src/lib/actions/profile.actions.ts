"use server";

import db from "@/db/drizzle";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { profileSchema } from "@/lib/validators";
import { deleteUploadThingFile } from "./upload.actions";
import { z } from "zod";

export type ProfileFormData = z.infer<typeof profileSchema> & {
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

    // Validate the data
    const validatedData = profileSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: "Invalid profile data",
      };
    }

    // Update the profile using the correct user ID
    const updatedProfile = await db
      .update(profiles)
      .set({
        ...data,
        profileCompleted: true,
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

    console.log("Profile completed successfully:", {
      userId: actualUserId,
      profileId: updatedProfile[0].id,
      completed: true,
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

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
