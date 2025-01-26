"use server";

import db from "@/db/drizzle";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

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
};

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
