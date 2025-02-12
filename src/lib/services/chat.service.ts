import db from "@/db/drizzle";
import { messages, matches } from "@/db/schema";
import { eq, and, or, not, sql } from "drizzle-orm";

export class ChatService {
  static async markMessagesAsRead(matchId: string, userId: string) {
    return db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          not(eq(messages.senderId, userId))
        )
      );
  }

  static async getUnreadCount(matchId: string, userId: string) {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.matchId, matchId),
          not(eq(messages.senderId, userId)),
          eq(messages.isRead, false)
        )
      );
    
    return Number(result.count);
  }

  static async validateMatchParticipant(matchId: string, userId: string) {
    const match = await db.query.matches.findFirst({
      where: and(
        eq(matches.id, matchId),
        or(
          eq(matches.user1Id, userId),
          eq(matches.user2Id, userId)
        )
      ),
    });
    
    return !!match;
  }
} 