import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type User } from "@/db/schema";

interface UserAvatarProps {
  user: User;
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