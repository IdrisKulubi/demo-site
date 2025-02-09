import { ChatWindow } from "@/components/chat/chat-window";
import { getMatchDetails } from "@/lib/actions/chat";

export default async function ChatPage(
  props: {
    params: Promise<{ userId: string }>;
  }
) {
  const params = await props.params;
  const { match, recipient } = await getMatchDetails(params.userId);

  return <ChatWindow matchId={match.id} recipient={recipient} currentUserId={recipient.user.id} initialMessages={[]} />;
}
