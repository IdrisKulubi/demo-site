"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { ImageUpload } from "@/components/shared/profile/image-upload";
import { Profile } from "@/lib/types";

interface ProfileImageUploadProps {
  profile: Profile;
  value?: string[];
  onChange?: (photos: string[]) => Promise<void>;
  onRemove?: (photoUrl: string) => Promise<void>;
  onProfilePhotoSelect?: (photoUrl: string) => Promise<void>;
  maxFiles?: number;
}

export function ProfileImageUpload({
  profile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  value,
  onChange = () => Promise.resolve(),
  onRemove = () => Promise.resolve(),
  onProfilePhotoSelect = () => Promise.resolve(),
  maxFiles = 6,
}: ProfileImageUploadProps) {
  const searchParams = useSearchParams();
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const shouldUpload = searchParams.get("upload") === "true";

  useEffect(() => {
    if (shouldUpload && imageUploadRef.current) {
      imageUploadRef.current.click();
    }
  }, [shouldUpload]);

  return (
    <ImageUpload
      ref={imageUploadRef}
      {...profile}
      onChange={onChange}
      onRemove={onRemove}
      onProfilePhotoSelect={onProfilePhotoSelect}
      maxFiles={maxFiles}
    />
  );
}
