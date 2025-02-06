"use client";

import { useState, useEffect } from "react";
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

  // Mobile-specific URL handling
  const getOptimizedUrl = (url: string) => {
    if (isMobile && url.includes("r2.dev")) {
      return `${url}?width=${Math.min(width, 750)}&quality=75&format=webp`;
    }
    return url;
  };

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
        const fallback = await fetch(`/api/profile/${userId}/photo`).then(
          (res) => res.json()
        );
        setImgSrc(fallback.url || "/default-avatar.png");
      } catch {
        setImgSrc("/default-avatar.png");
      }
      setIsLoading(false);
    };

    loadImage();
  }, [src, retryCount, isMobile, userId, width]);

  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0">
          <Skeleton className="h-full w-full animate-shimmer" />
        </div>
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        loading={priority ? "eager" : "lazy"}
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        quality={80}
        onError={() => {
          setImgSrc("/default-avatar.png");
          setIsLoading(false);
        }}
      />
    </div>
  );
}
