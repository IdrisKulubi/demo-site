import { trackProfileView } from "@/lib/actions/stalker.actions";
import { useAction } from "next-safe-action/hooks";

export function ProfilePreviewModal({ profile }: ProfilePreviewModalProps) {
  const { execute: trackView } = useAction(trackProfileView);

  useEffect(() => {
    if (profile) {
      trackView(profile.userId);
    }
  }, [profile, trackView]);
} 