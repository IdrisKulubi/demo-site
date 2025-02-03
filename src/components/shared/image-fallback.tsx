"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Directly try to load the image
        await new Promise((resolve, reject) => {
          const img = new HTMLImageElement();
          img.width = width;
          img.height = height;
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });

        setImgSrc(src);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, Math.pow(2, retryCount) * 1000);
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
      }
    };

    loadImage();
  }, [userId, src, retryCount,width,height]);

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
        onError={() => {
          setImgSrc("/default-avatar.png");
          setIsLoading(false);
        }}
        loading={priority ? "eager" : "lazy"}
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        quality={80}
      />
    </div>
  );
}
