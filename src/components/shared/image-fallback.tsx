"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedProfilePicture } from "@/lib/redis";

type ImageFallbackProps = {
  userId: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export function ImageFallback({ userId, src, ...props }: ImageFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyImage = async () => {
      try {
        // Check cache first
        const cached = await getCachedProfilePicture(userId);
        if (cached) {
          setImgSrc(cached);
          return;
        }

        // Validate image existence
        const res = await fetch(src, { method: "HEAD" });
        if (!res.ok) throw new Error("Image missing");
      } catch (error) {
        // Fallback to first photo or default
        const fallback = await fetch(`/api/profile/${userId}/photo`).then(
          (res) => res.json()
        );
        setImgSrc(fallback.url || "/default-avatar.png");
      } finally {
        setIsLoading(false);
      }
    };

    verifyImage();
  }, [userId, src]);

  return (
    <div className="relative">
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        {...props}
        src={imgSrc}
        onError={() => setImgSrc("/default-avatar.png")}
        className={isLoading ? "opacity-0" : "opacity-100 transition-opacity"}
      />
    </div>
  );
}
