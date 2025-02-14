import {
  getSwipableProfiles,
  getLikedProfiles,
  getLikedByProfiles,
} from "@/lib/actions/explore.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SwipeStack } from "@/components/explore/cards/swipe-stack";
import { NoMoreProfiles } from "@/components/explore/empty-state";
import { type Profile } from "@/db/schema";
import { getProfile } from "@/lib/actions/profile.actions";
import { ExploreMobileV2 } from "@/components/explore/mobile/explore-mobile-v2";
import { checkProfileCompletion } from "@/lib/checks";

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Only check if profile exists
  const { hasProfile } = await checkProfileCompletion();

  // Redirect to setup only if no profile exists
  if (!hasProfile) {
    redirect("/profile/setup");
  }

  const profiles = await getSwipableProfiles();
  const { profiles: likedProfiles } = await getLikedProfiles();
  const { profiles: likedByProfiles } = await getLikedByProfiles();

  // Current user's profile
  const currentUserProfile = await getProfile();

  return (
    <div className="h-full">


      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden md:block container mx-auto px-4 pt-24 pb-2">
          <div className="relative mb-4 max-w-4xl mx-auto">
            <div
              aria-hidden="true"
              className="absolute -top-6 right-1/4 text-pink-500/10 text-7xl select-none animate-float"
            >
              💖
            </div>
            <div
              aria-hidden="true"
              className="absolute -top-4 left-1/4 text-pink-500/10 text-6xl select-none rotate-[-15deg] animate-float delay-1000"
            >
              🌟
            </div>

            <div className="relative mx-auto max-w-2xl text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3 text-gradient bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600 bg-clip-text text-transparent">
                Find Your Valentine 💘
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                Swipe right on profiles that spark joy ✨ Left if it&apos;s not
                your vibe
              </p>
            </div>
          </div>
        </div>

        {/* Conditional Rendering based on screen size */}
        <div className="md:hidden">
          <ExploreMobileV2
            currentUser={
              session.user as {
                id: string;
                image: string;
                name: string;
                email: string;
              }
            }
            currentUserProfile={currentUserProfile as Profile}
            initialProfiles={profiles as Profile[]}
            likedByProfiles={likedByProfiles}
            likedProfiles={likedProfiles}

          />
        </div>
        <div className="hidden md:block">
          <div className="container mx-auto px-4 flex justify-center">
            {profiles && profiles.length > 0 ? (
              <div className="w-full max-w-[640px] -ml-32">
                <SwipeStack
                  initialProfiles={profiles as Profile[]}
                  currentUserProfile={currentUserProfile as Profile}
                  likedByProfiles={likedByProfiles}
                  currentUser={session.user}
                />
              </div>
            ) : (
              <NoMoreProfiles
                initialLikedProfiles={likedProfiles || []}
                currentUser={session.user}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
