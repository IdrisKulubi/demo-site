import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileSection } from "@/components/profile/profile-section";
import { SwipeInterface } from "@/components/swipe/swipe-interface";
import { MatchesHeader } from "@/components/matches/matches-header";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-pink-950 dark:to-background">
      <MatchesHeader />
      <main className="container max-w-md mx-auto px-4 py-6 space-y-8">
        <ProfileSection />
        <SwipeInterface />
      </main>
    </div>
  );
}
