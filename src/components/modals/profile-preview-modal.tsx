import { users } from "@/db/schema";
import { trackProfileView } from "@/lib/actions/stalker.actions";
import { InferSelectModel } from "drizzle-orm";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";

type User = InferSelectModel<typeof users>;
export function ProfilePreviewModal({ profile }: { profile: User }) {
  const { execute: trackView } = useAction(trackProfileView);

  useEffect(() => {
    if (profile) {
      trackView(profile.id);
    }
  }, [profile, trackView]);
} 