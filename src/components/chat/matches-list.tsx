import { trackProfileView } from "@/lib/actions/stalker.actions";

const handleViewProfile = (match: Profile) => {
  trackProfileView(match.userId);
  // Existing profile view logic
}; 