"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/actions/profile.actions";
import { useSession } from "next-auth/react";

export function useImageReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasEnoughImages, setHasEnoughImages] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const checkImages = async () => {
      if (!session?.user) return;

      try {
        const profile = await getProfile();
        const hasImages = profile?.photos && profile.photos.length >= 3;
        const needsReminder = !hasImages || profile?.photos.some((p) => !p);

        if (needsReminder) {
          setIsOpen(true);
          setHasEnoughImages(!!hasImages);
        }
      } catch (error) {
        console.error("Image check failed:", error);
      }
    };

    checkImages();
  }, [session]);

  return { isOpen, setIsOpen, hasEnoughImages };
}
