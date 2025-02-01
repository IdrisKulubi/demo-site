"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { profileSchema } from "../validators";
import { deleteUploadThingFile } from "./upload.actions";
import { cacheProfilePicture, getCachedProfilePicture } from "../redis";

export type ProfileFormData = {
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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePhoto?: string;
};

export async function getProfile() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.error("No user email in session");
      return null;
    }

    // Find user by email with all user fields
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastActive: users.lastActive,
        isOnline: users.isOnline,
        photos: users.image,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      console.error("User not found by email:", session.user.email);
      throw new Error("User not found");
    }

    const actualUserId = user[0].id;

    // Get complete profile data
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, actualUserId))
      .limit(1);

    // Try to get profile photo from cache first
    const cachedProfilePhoto = await getCachedProfilePicture(actualUserId);

    // If no profile exists yet, return basic user info
    if (!profile || profile.length === 0) {
      return {
        ...user[0],
        profilePhoto: cachedProfilePhoto || user[0].photos,
        profileCompleted: false,
      };
    }

    // Combine user and profile data
    const combinedProfile = {
      ...user[0],
      ...profile[0],
      profilePhoto:
        cachedProfilePhoto || profile[0].profilePhoto || user[0].photos,
      // Check if all required fields are completed
      profileCompleted: Boolean(
        profile[0].firstName &&
          profile[0].lastName &&
          profile[0].bio &&
          profile[0].age &&
          profile[0].gender &&
          profile[0].lookingFor &&
          profile[0].course &&
          profile[0].yearOfStudy &&
          profile[0].photos &&
          profile[0].isVisible &&
          profile[0].lastActive &&
          profile[0].isComplete
      ),
    };

    return combinedProfile;
  } catch (error) {
    console.error("Error in getProfile:", error);
    throw error;
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
      .select({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
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

    // Validate data against schema
    const validationResult = profileSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error);
      return {
        success: false,
        error: "Invalid profile data",
        validationErrors: validationResult.error.errors,
      };
    }

    // First check if profile exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    const profileData = {
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
      profilePhoto: data.profilePhoto || data.photos[0],
      updatedAt: new Date(),
      profileCompleted: true,
      isComplete: true,
    };

    // Create or update profile
    if (!existingProfile || existingProfile.length === 0) {
      // Create new profile
      await db.insert(profiles).values({
        ...profileData,
        userId: session.user.id,
        isVisible: true,
        lastActive: new Date(),
      });
    } else {
      // Update existing profile
      await db
        .update(profiles)
        .set(profileData)
        .where(eq(profiles.userId, session.user.id));
    }

    // Update user's phone number and profile photo
    await db
      .update(users)
      .set({
        phoneNumber: data.phoneNumber,
        profilePhoto: profileData.profilePhoto,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/explore");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
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

    // Cache the profile photo URL
    await cacheProfilePicture(session.user.id, photoUrl);

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
    if (!Array.isArray(profile.photos) || profile.photos.length <= 1) {
      return {
        success: false,
        error: "You must keep at least one photo 📸",
      };
    }

    const updatedPhotos = profile.photos.filter((p) => p !== photoUrl);
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
