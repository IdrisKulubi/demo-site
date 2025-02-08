/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

type ImageFallbackProps = {
  userId: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

export function ImageFallback({
  userId,
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  ...props
}: ImageFallbackProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const getOptimizedUrl = useCallback(
    (url: string) => {
      if (isMobile && url.includes("r2.dev")) {
        return `${url}?width=${Math.min(width, 750)}&quality=75&format=webp`;
      }
      return url;
    },
    [isMobile, width]
  );

  useEffect(() => {
    const loadImage = async () => {
      const optimizedUrl = getOptimizedUrl(src);

      try {
        await new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = optimizedUrl;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
        setImgSrc(optimizedUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Image load error:", error);
        handleFallback();
      }
    };

    const handleFallback = async () => {
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          loadImage();
        }, 1000 * retryCount);
        return;
      }

      try {
        setImgSrc("/default-avatar.png");
      } catch {
        setImgSrc("/default-avatar.png");
      }
      setIsLoading(false);
    };

    loadImage();
  }, [src, retryCount, isMobile, userId, width, getOptimizedUrl]);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      {isLoading && (
        <div className="absolute inset-0">
          <Skeleton className="h-full w-full animate-shimmer" />
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          "object-cover"
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading={priority ? "eager" : "lazy"}
        onError={() => {
          setImgSrc("/default-avatar.png");
          setIsLoading(false);
        }}
      />
    </div>
  );
}
