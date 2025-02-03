"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const optimizedSrc = `${src}?width=${width}&quality=${priority ? 80 : 70}`;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <Skeleton className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      )}

      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        quality={priority ? 80 : 70}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${btoa(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#F3F4F6" />
          </svg>`
        )}`}
      />

      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-400">📸</span>
        </div>
      )}
    </div>
  );
}
