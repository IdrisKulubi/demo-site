"use server";

import { auth } from "@/auth";
import { getProfile } from "@/lib/actions/profile.actions";

export async function checkProfileCompletion() {
  const session = await auth();
  if (!session?.user) return { hasProfile: false, isComplete: false };

  try {
    const profile = await getProfile();
    return {
      hasProfile: !!profile,
      isComplete: profile?.profileCompleted || false,
      profile
    };
  } catch (error) {
    console.error("Profile check failed:", error);
    return { hasProfile: false, isComplete: false };
  }
}

export type ProfileCheckResult = Awaited<ReturnType<typeof checkProfileCompletion>>; 