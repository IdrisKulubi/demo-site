import { ChatWindow } from "@/components/chat/chat-window";
import { getMatchDetails } from "@/lib/actions/chat.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: { matchId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const { match, partner } = await getMatchDetails(
      params.matchId,
      session.user.id
    );
    
    return <ChatWindow matchId={match.id} partner={partner} recipient={partner} />;
  } catch (error) {
    console.error("Chat Error:", error);
    redirect("/matches");
  }
} 