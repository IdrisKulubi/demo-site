import { getSwipableProfiles } from "@/lib/actions/explore.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SwipeStack } from "@/components/explore/cards/swipe-stack";

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profilesResult = await getSwipableProfiles();
  const profiles = profilesResult.map((p) => p.profiles);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background">
      <div className="container max-w-4xl pt-24 pb-12">
        {/* Decorative elements */}
        <div className="relative mb-12">
          <div
            aria-hidden="true"
            className="absolute -top-6 right-0 text-pink-500/10 text-7xl select-none animate-float"
          >
            💖
          </div>
          <div
            aria-hidden="true"
            className="absolute -top-4 left-0 text-pink-500/10 text-6xl select-none rotate-[-15deg] animate-float delay-1000"
          >
            🌟
          </div>

          {/* Page header */}
          <div className="relative text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3 text-gradient bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600 bg-clip-text text-transparent">
              Find Your Valentine 💘
            </h1>
            <p className="text-lg text-muted-foreground">
              Swipe right on profiles that spark joy ✨ Left if it&apos;s not
              your vibe
            </p>
          </div>
        </div>

        {/* Swipe interface */}
        {profiles.length > 0 ? (
          <SwipeStack initialProfiles={profiles} />
        ) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-xl text-pink-600/80">
              No more profiles to swipe... for now! 🌹
            </p>
            <p className="text-muted-foreground">
              Check back later or update your preferences
            </p>
            <div className="animate-pulse">✨💫✨</div>
          </div>
        )}
      </div>
    </div>
  );
}
