import { WebSocket, WebSocketServer } from "ws";
import { auth } from "@/auth";
import { matches, messages, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import db from "@/db/drizzle";
import { Session } from "next-auth";

export const ChatWSServer = {
  wss: null as WebSocketServer | null,
  clients: new Map<string, WebSocket>(),

  init() {
    this.wss = new WebSocketServer({ port: 3001 });

    this.wss.on("connection", async (ws, req) => {
      // Get auth token from request headers or query params
      const authToken = new URL(req.url!, "http://localhost").searchParams.get(
        "token"
      );
      if (!authToken) return ws.close();

      // Create a mock context for auth
      const context = {
        req: {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const session = await auth(context);
      if (!session?.user?.id) return ws.close();

      this.clients.set(session.user.id, ws);

      ws.on("close", () => this.clients.delete(session.user.id));
      ws.on("message", (data) => {
        const message = data.toString(); // Convert RawData to string
        this.handleMessage(session.user.id, message);
      });
    });
  },

  handleMessage(userId: string, data: string) {
    const message = JSON.parse(data);
    switch (message.type) {
      case "typing":
        this.broadcastTyping(userId, message.matchId, message.isTyping);
        break;
      case "presence":
        this.updatePresence(userId, message.isOnline);
        break;
      case "message":
        this.broadcastMessage(message);
        break;
    }
  },

  async getMatchParticipants(matchId: string) {
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
      columns: { user1Id: true, user2Id: true },
    });
    return match ? [match.user1Id, match.user2Id] : [];
  },

  async broadcastTyping(userId: string, matchId: string, isTyping: boolean) {
    const participants = await this.getMatchParticipants(matchId);
    const recipientId = participants.find((id) => id !== userId);

    if (recipientId && this.clients.has(recipientId)) {
      this.clients.get(recipientId)?.send(
        JSON.stringify({
          type: "typing",
          matchId,
          isTyping,
        })
      );
    }
  },

  async updatePresence(userId: string, isOnline: boolean) {
    await db
      .update(users)
      .set({ isOnline, lastActive: new Date() })
      .where(eq(users.id, userId));

    const userMatches = await db.query.matches.findMany({
      where: or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
      columns: { id: true, user1Id: true, user2Id: true },
    });

    userMatches.forEach((match) => {
      const recipientId =
        match.user1Id === userId ? match.user2Id : match.user1Id;
      if (this.clients.has(recipientId)) {
        this.clients.get(recipientId)?.send(
          JSON.stringify({
            type: "presence",
            userId,
            isOnline,
          })
        );
      }
    });
  },

  async broadcastMessage(message: typeof messages.$inferSelect) {
    const newMessage = await db
      .insert(messages)
      .values({
        ...message,
        createdAt: new Date(),
      })
      .returning();

    const participants = await this.getMatchParticipants(message.matchId);
    participants.forEach((userId) => {
      if (userId !== message.senderId && this.clients.has(userId)) {
        this.clients.get(userId)?.send(
          JSON.stringify({
            type: "message",
            ...newMessage[0],
            status: "delivered",
          })
        );
      }
    });
  },

  handleConnection(session: Session, ws: WebSocket) {
    this.updatePresence(session.user.id, true);

    ws.on("close", async () => {
      this.clients.delete(session.user.id);
      await this.updatePresence(session.user.id, false);
    });
  },

  // ... other methods ...
};
