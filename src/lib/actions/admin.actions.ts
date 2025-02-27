import { auth } from "@/auth";
import db from "@/db/drizzle";
import { eq, sql } from "drizzle-orm";
import { users, matches, reports, messages, contests } from "@/db/schema";
import { deleteUploadThingFile } from "./upload.actions";
import { desc } from "drizzle-orm";

export const getAdminStats = async () => {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  const [usersData, matchesData, reportsData, messagesData] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(matches),
    db.select({ count: sql<number>`count(*)` }).from(reports).where(eq(reports.status, "PENDING")),
    db.select({ count: sql<number>`count(*)` }).from(messages)
  ]);

  return {
    totalUsers: usersData[0].count,
    totalMatches: matchesData[0].count,
    pendingReports: reportsData[0].count,
    totalMessages: messagesData[0].count
  };
};

export const deleteUserWithImages = async (userId: string) => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");

  // Delete user images from UploadThing
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { profile: true }
  });

  if (user?.profile?.photos) {
    await Promise.all(
      user.profile.photos.map(url => 
        deleteUploadThingFile(url.split('/').pop()?.split('.')[0] || '')
      )
    );
  }

  await db.delete(users).where(eq(users.id, userId));
};

export const getUsers = async () => {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  return db.query.users.findMany({
    with: { profile: true },
    orderBy: (users, { desc }) => [desc(users.createdAt)]
  });
};

export async function getAdminContests() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Unauthorized");

  return db.query.contests.findMany({
    orderBy: [desc(contests.createdAt)]
  });
} 