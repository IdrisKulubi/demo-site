import { trackProfileView } from "@/lib/actions/stalker.actions";

const handleProfileClick = (userId: string) => {
  trackProfileView(userId);
  // Existing click logic
}; 