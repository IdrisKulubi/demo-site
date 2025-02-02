"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/actions/profile.actions";
import { useSession } from "next-auth/react";

export function useImageReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasEnoughImages, setHasEnoughImages] = useState(false);
  const [hasSeenReminder, setHasSeenReminder] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("hasSeenImageReminder") === "true";
  });
  const { data: session } = useSession();

  useEffect(() => {
    const checkImages = async () => {
      if (!session?.user) return;

      try {
        const profile = await getProfile();
        const hasImages = (profile?.photos ?? []).length >= 3;
        const needsReminder =
          !hasImages || ((profile?.photos ?? []) as string[]).some((p) => !p);

        if (needsReminder && !hasSeenReminder) {
          setIsOpen(true);
          setHasEnoughImages(!!hasImages);
          setHasSeenReminder(true);
          localStorage.setItem("hasSeenImageReminder", "true");
        }
      } catch (error) {
        console.error("Image check failed:", error);
      }
    };

    checkImages();
  }, [session, hasSeenReminder]);

  return { isOpen, setIsOpen, hasEnoughImages, hasSeenReminder };
}
