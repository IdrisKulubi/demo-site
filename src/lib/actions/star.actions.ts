"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { starredProfiles, profiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function starProfile(profileId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await db.insert(starredProfiles).values({
      userId: session.user.id,
      starredId: profileId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error starring profile:", error);
    return { error: "Failed to star profile" };
  }
}

export async function unstarProfile(profileId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await db
      .delete(starredProfiles)
      .where(
        and(
          eq(starredProfiles.userId, session.user.id),
          eq(starredProfiles.starredId, profileId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error unstarring profile:", error);
    return { error: "Failed to unstar profile" };
  }
}

export async function getStarredProfiles() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const starred = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        bio: profiles.bio,
        age: profiles.age,
        gender: profiles.gender,
        interests: profiles.interests,
        photos: profiles.photos,
        course: profiles.course,
        yearOfStudy: profiles.yearOfStudy,
        profilePhoto: profiles.profilePhoto,
        instagram: profiles.instagram,
        spotify: profiles.spotify,
        snapchat: profiles.snapchat,
        starredAt: starredProfiles.createdAt,
      })
      .from(starredProfiles)
      .innerJoin(profiles, eq(profiles.userId, starredProfiles.starredId))
      .where(eq(starredProfiles.userId, session.user.id))
      .orderBy(starredProfiles.createdAt);

    return starred;
  } catch (error) {
    console.error("Error fetching starred profiles:", error);
    return [];
  }
}

export async function isProfileStarred(profileId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    const star = await db
      .select()
      .from(starredProfiles)
      .where(
        and(
          eq(starredProfiles.userId, session.user.id),
          eq(starredProfiles.starredId, profileId)
        )
      )
      .limit(1);

    return star.length > 0;
  } catch (error) {
    console.error("Error checking if profile is starred:", error);
    return false;
  }
}
