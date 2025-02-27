import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type users } from "@/db/schema";

interface UserAvatarProps {
  user: typeof users.$inferSelect;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image || ""} alt={user.name || ""} />
      <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
} 