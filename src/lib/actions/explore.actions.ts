/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import db from "@/db/drizzle";
import { profiles, swipes, matches, users } from "@/db/schema";
import { eq, and, not, isNull, or, sql, inArray } from "drizzle-orm";
import { auth } from "@/auth";

export async function getSwipableProfiles() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    // Get current user's profile for preferences
    const currentUserProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!currentUserProfile.length) return [];


    // Get user's recent likes to understand their preferences
    const recentLikes = await db
      .select({
        swipedId: swipes.swipedId,
      })
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.isLike, true)
        )
      )
      .orderBy(swipes.createdAt)
      .limit(50);

    // Get profiles of recently liked users to analyze patterns
    const likedProfiles = recentLikes.length > 0 
      ? await db
          .select({
            interests: profiles.interests,
            course: profiles.course,
            yearOfStudy: profiles.yearOfStudy,
          })
          .from(profiles)
          .where(
            inArray(
              profiles.userId,
              recentLikes.map(like => like.swipedId)
            )
          )
      : [];

    // Extract common patterns from liked profiles
    const likedInterests = new Set(
      likedProfiles.flatMap(p => p.interests as string[])
    );
    const likedCourses = new Set(
      likedProfiles.map(p => p.course)
    );

    // Get potential matches prioritizing:
    // 1. Active users (most important factor per Tinder)
    // 2. Users with similar interests to those previously liked
    // 3. Users with similar academic background to those previously liked
    const results = await db
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
        phoneNumber: users.phoneNumber,
        lastActive: profiles.lastActive,
        isMatch: matches.id,
      })
      .from(profiles)
      .leftJoin(users, eq(users.id, profiles.userId))
      .leftJoin(
        swipes,
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.swipedId, profiles.userId)
        )
      )
      .leftJoin(
        matches,
        and(
          or(
            and(
              eq(matches.user1Id, session.user.id),
              eq(matches.user2Id, profiles.userId)
            ),
            and(
              eq(matches.user2Id, session.user.id),
              eq(matches.user1Id, profiles.userId)
            )
          )
        )
      )
      .where(
        and(
          // Basic filters
          not(eq(profiles.userId, session.user.id)),
          eq(profiles.isVisible, true),
          isNull(swipes.id),
          
          // Required fields
          not(isNull(profiles.firstName)),
          not(isNull(profiles.lastName)),
          not(isNull(profiles.bio)),
          not(isNull(profiles.age)),
          not(isNull(profiles.gender)),
          not(isNull(profiles.interests)),
          not(isNull(profiles.photos)),
          not(isNull(profiles.course)),
          not(isNull(profiles.yearOfStudy)),
          not(isNull(profiles.profilePhoto)),
          not(isNull(users.phoneNumber)),
          
          // Quality filters
          sql`jsonb_array_length(${profiles.photos}::jsonb) > 0`,
          sql`length(${profiles.bio}) > 0`,
          sql`jsonb_array_length(${profiles.interests}::jsonb) > 0`,
          
          // Activity filter - only show profiles active in last 7 days
          sql`${profiles.lastActive} > NOW() - INTERVAL '2 days'`
        )
      )
      // Order by most recently active first (Tinder's primary factor)
      .orderBy(
        sql`
          CASE
            -- Super active users (active in last 24 hours)
            WHEN ${profiles.lastActive} > NOW() - INTERVAL '9 hours' 
            THEN 1
            -- Active users (active in last 1 day)
            WHEN ${profiles.lastActive} > NOW() - INTERVAL '1 day' 
            THEN 2
            -- Less active users (active in last week)
            ELSE 3
          END,
          -- Add some randomization within each activity group
          RANDOM()
        `
      )
      .limit(25);

    // Post-process results to prioritize matches based on user preferences
    const processedResults = results
      .map(profile => {
        // Calculate similarity to liked profiles
        const interestOverlap = likedInterests.size > 0
          ? (profile.interests as string[]).filter(i => likedInterests.has(i)).length / likedInterests.size
          : 0;
        
        const courseMatch = likedCourses.size > 0
          ? likedCourses.has(profile.course)
          : false;

        return {
          ...profile,
          isMatch: !!profile.isMatch,
          // Use these factors for sorting but don't send to client
          _matchScore: interestOverlap + (courseMatch ? 0.5 : 0)
        };
      })
      // Sort by match score within each activity group
      .sort((a, b) => b._matchScore - a._matchScore)
      // Remove internal scoring before sending to client
      .map(({ _matchScore, ...profile }) => profile)
      // Limit to 10 final results
      .slice(0, 10);

    return processedResults;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

export async function recordSwipe(
  targetUserId: string,
  action: "like" | "pass"
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Record the swipe
    await db.insert(swipes).values({
      swiperId: session.user.id,
      swipedId: targetUserId,
      isLike: action === "like",
      createdAt: new Date(),
    });

    // If it's a like, check for mutual like (match)
    if (action === "like") {
      const mutualLike = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.swiperId, targetUserId),
            eq(swipes.swipedId, session.user.id),
            eq(swipes.isLike, true)
          )
        )
        .limit(1);

      // If there's a mutual like, create a match
      if (mutualLike.length > 0) {
        await db.insert(matches).values({
          id: crypto.randomUUID(),
          user1Id: session.user.id,
          user2Id: targetUserId,
          createdAt: new Date(),
          lastMessageAt: null,
          user1Typing: false,
          user2Typing: false,
        });
        return { success: true, isMatch: true };
      }
    }

    return { success: true, isMatch: false };
  } catch (error) {
    console.error("Error recording swipe:", error);
    return { success: false, error: "Failed to record swipe" };
  }
}

export async function undoLastSwipe(swipedId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: "Bestie, you need to sign in first " };

  try {
    const lastSwipe = await db
      .select()
      .from(swipes)
      .where(
        and(eq(swipes.swiperId, session.user.id), eq(swipes.swipedId, swipedId))
      )
      .orderBy(swipes.createdAt)
      .limit(1)
      .then(async (rows) => {
        if (rows.length === 0) return [];
        return db.delete(swipes).where(eq(swipes.id, rows[0].id)).returning();
      });

    return { success: true, lastSwipe };
  } catch (error) {
    console.error("Can't undo that bestie ", error);
    return { error: "No take-backsies rn, try again later " };
  }
}

export async function getLikedProfiles() {
  const session = await auth();
  if (!session?.user?.id) return { profiles: [], error: "Unauthorized" };

  try {

    const results = await db
      .select({
        profile: profiles,
        isMatch: matches.id,
      })
      .from(swipes)
      .innerJoin(profiles, eq(profiles.userId, swipes.swipedId))
      .leftJoin(
        matches,
        and(
          or(
            and(
              eq(matches.user1Id, session.user.id),
              eq(matches.user2Id, profiles.userId)
            ),
            and(
              eq(matches.user2Id, session.user.id),
              eq(matches.user1Id, profiles.userId)
            )
          )
        )
      )
      .where(
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.isLike, true),
          isNull(matches.id)
        )
      );

   

    return {
      profiles: results.map((r) => ({ ...r.profile, isMatch: !!r.isMatch })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching liked profiles:", error);
    return { profiles: [], error: "Failed to fetch profiles" };
  }
}

export async function getLikedByProfiles() {
  const session = await auth();
  if (!session?.user?.id) return { profiles: [], error: "Unauthorized" };

  try {

    const results = await db
      .select({
        profile: profiles,
        isMatch: matches.id,
        swipe: swipes,
      })
      .from(swipes)
      .innerJoin(profiles, eq(profiles.userId, swipes.swiperId))
      .leftJoin(
        matches,
        and(
          or(
            and(
              eq(matches.user1Id, session.user.id),
              eq(matches.user2Id, profiles.userId)
            ),
            and(
              eq(matches.user2Id, session.user.id),
              eq(matches.user1Id, profiles.userId)
            )
          )
        )
      )
      .where(
        and(
          eq(swipes.swipedId, session.user.id),
          eq(swipes.isLike, true),
          isNull(matches.id)
        )
      );

  

    return {
      profiles: results.map((r) => ({ ...r.profile, isMatch: !!r.isMatch })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching profiles that liked you:", error);
    return { profiles: [], error: "Failed to fetch profiles" };
  }
}
