"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { 
  contests, 
  contestEntries, 
  contestVotes,
  
  
} from "@/db/schema";
import { eq, and, desc, sql, gte, lte} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { pusher } from "@/lib/pusher/server";

// Schema for contest entry submission
const contestEntrySchema = z.object({
  contestId: z.string().uuid(),
  entryType: z.enum(["photo", "bio"]),
  photoUrl: z.string().url().optional(),
  bioText: z.string().max(1000).optional(),
  caption: z.string().max(200).optional(),
});

// Get active contests
export async function getActiveContests() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const now = new Date();
  
  return db.query.contests.findMany({
    where: and(
      eq(contests.isActive, true),
      lte(contests.startDate, now),
      gte(contests.endDate, now)
    ),
    orderBy: [desc(contests.endDate)],
  });
}

// Get all contests (for admin)
export async function getAllContests() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  return db.query.contests.findMany({
    orderBy: [desc(contests.createdAt)],
  });
}

// Create a new contest (admin only)
export async function createContest(data: {
  title: string;
  description: string;
  type: "photo" | "bio" | "both";
  startDate: Date;
  endDate: Date;
}) {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  await db.insert(contests).values({
    title: data.title,
    description: data.description,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
  });

  revalidatePath("/admin/contests");
  return { success: true };
}

// Submit a contest entry
export async function submitContestEntry(data: z.infer<typeof contestEntrySchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Validate the data
  const validated = contestEntrySchema.parse(data);

  // Check if entry type matches contest type
  const contest = await db.query.contests.findFirst({
    where: eq(contests.id, validated.contestId),
  });

  if (!contest) throw new Error("Contest not found");
  
  if (
    contest.type !== "both" && 
    contest.type !== validated.entryType
  ) {
    throw new Error(`This contest only accepts ${contest.type} entries`);
  }

  // Check if user already has an entry for this contest
  const existingEntry = await db.query.contestEntries.findFirst({
    where: and(
      eq(contestEntries.contestId, validated.contestId),
      eq(contestEntries.userId, session.user.id)
    ),
  });

  if (existingEntry) {
    throw new Error("You have already submitted an entry for this contest");
  }

  // Create the entry
  const [entry] = await db.insert(contestEntries).values({
    contestId: validated.contestId,
    userId: session.user.id,
    entryType: validated.entryType,
    photoUrl: validated.photoUrl,
    bioText: validated.bioText,
    caption: validated.caption,
    // Auto-approve for now, in production you might want admin approval
    isApproved: true,
  }).returning();

  revalidatePath("/contests");
  return { success: true, entry };
}

// Vote for a contest entry
export async function voteForEntry(entryId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Check if user already voted for this entry
  const existingVote = await db.query.contestVotes.findFirst({
    where: and(
      eq(contestVotes.entryId, entryId),
      eq(contestVotes.userId, session.user.id)
    ),
  });

  if (existingVote) {
    throw new Error("You have already voted for this entry");
  }

  // Create the vote
  await db.insert(contestVotes).values({
    entryId,
    userId: session.user.id,
  });

  // Update vote count
  await db.update(contestEntries)
    .set({ 
      voteCount: sql`${contestEntries.voteCount} + 1`,
      updatedAt: new Date()
    })
    .where(eq(contestEntries.id, entryId));

  // Get updated entry for real-time update
  const updatedEntry = await db.query.contestEntries.findFirst({
    where: eq(contestEntries.id, entryId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  });

  // Trigger real-time update via Pusher
  await pusher.trigger(`contest-${updatedEntry?.contestId}`, "vote-update", {
    entryId,
    voteCount: updatedEntry?.voteCount,
    voterId: session.user.id
  });

  revalidatePath("/contests");
  return { success: true, voteCount: updatedEntry?.voteCount };
}

// Get entries for a contest
export async function getContestEntries(contestId: string, sortBy: "newest" | "popular" = "popular") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const entries = await db.query.contestEntries.findMany({
    where: and(
      eq(contestEntries.contestId, contestId),
      eq(contestEntries.isApproved, true)
    ),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true
        },
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              profilePhoto: true
            }
          }
        }
      },
      votes: {
        where: eq(contestVotes.userId, session.user.id),
        limit: 1
      }
    },
    orderBy: sortBy === "newest" 
      ? [desc(contestEntries.createdAt)]
      : [desc(contestEntries.voteCount), desc(contestEntries.createdAt)]
  });

  // Add hasVoted flag to each entry
  return entries.map(entry => ({
    ...entry,
    hasVoted: entry.votes.length > 0
  }));
}

// Get winners for Hall of Fame
export async function getContestWinners(limit = 10) {
  return db.query.contestEntries.findMany({
    where: eq(contestEntries.isWinner, true),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true
        },
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              profilePhoto: true
            }
          }
        }
      },
      contest: true
    },
    orderBy: [desc(contestEntries.updatedAt)],
    limit
  });
}

// Select winners (admin only)
export async function selectWinners(contestId: string) {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  // Get top 3 entries by vote count
  const topEntries = await db.query.contestEntries.findMany({
    where: and(
      eq(contestEntries.contestId, contestId),
      eq(contestEntries.isApproved, true)
    ),
    orderBy: [desc(contestEntries.voteCount)],
    limit: 3
  });

  // Mark them as winners
  if (topEntries.length > 0) {
    await db.update(contestEntries)
      .set({
        isWinner: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(contestEntries.contestId, contestId),
          sql`${contestEntries.id} IN (${topEntries.map(e => e.id).join(',')})`
        )
      );
  }

  // Close the contest
  await db.update(contests)
    .set({ 
      isActive: false,
      updatedAt: new Date()
    })
    .where(eq(contests.id, contestId));

  revalidatePath("/contests");
  revalidatePath("/hall-of-fame");
  return { success: true, winners: topEntries };
}

// Get user's contest entries
export async function getUserContestEntries() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.query.contestEntries.findMany({
    where: eq(contestEntries.userId, session.user.id),
    with: {
      contest: true
    },
    orderBy: [desc(contestEntries.createdAt)]
  });
}

// Add this to existing contest actions
export async function getAdminContests() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  return db.query.contests.findMany({
    with: {
      entries: {
        with: {
          user: {
            columns: { id: true, name: true },
            with: { profile: true }
          }
        }
      }
    },
    orderBy: [desc(contests.createdAt)]
  });
} 