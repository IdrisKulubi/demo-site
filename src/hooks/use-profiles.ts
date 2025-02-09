"use client";

import { useState } from "react";
import { Profile } from "@/db/schema";
import { recordSwipe } from "@/lib/actions/explore.actions";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const handleSwipe = async (userId: string, isLike: boolean) => {
    const result = await recordSwipe(userId, isLike ? "like" : "pass");
    return result.isMatch || false;
  };

  return {
    profiles,
    currentProfile,
    handleSwipe,
  };
} 