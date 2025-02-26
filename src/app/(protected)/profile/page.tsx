import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile, ProfileFormData } from "@/lib/actions/profile.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { checkProfileCompletion } from "@/lib/checks";
import { MobileNav } from "@/components/explore/mobile/mobile-nav";
import { StalkersList } from "@/components/profile/stalkers-list";

// This should remain a Server Component for optimal performance
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { hasProfile } = await checkProfileCompletion();
  if (!hasProfile) redirect("/profile/setup");

  const profile = await getProfile();
  if (!profile) redirect("/profile/setup");

  return (
    <>
      <MobileNav />
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background">
        <div className="container max-w-4xl pt-24 pb-12">
          {/* Header Section - Static content */}
          <div className="relative space-y-4 mb-12">
            {/* Static decorative elements */}
            <div
              aria-hidden="true"
              className="absolute -top-6 right-0 text-pink-500/10 text-7xl select-none"
            >
              💝
            </div>
            <div
              aria-hidden="true"
              className="absolute -top-4 left-0 text-pink-500/10 text-6xl select-none rotate-[-15deg]"
            >
              ✨
            </div>

            {/* Title Group - Static content */}
            <div className="relative">
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-gradient bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600 bg-clip-text text-transparent">
                <Sparkles
                  aria-hidden="true"
                  className="w-8 h-8 text-pink-500"
                />
                <span>My Profile</span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Update your profile and find your perfect match 💝
              </p>
            </div>

            {/* Status indicator - Static styling */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 text-sm font-medium">
              <div className="relative flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <div className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
              </div>
              <span>Profile Active</span>
            </div>
          </div>
          <section className="space-y-6">
            <StalkersList />
          </section>
          {/* Card Container - Static structure */}
          <div className="relative">
            {/* Static background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-white/50 dark:bg-background/50 rounded-2xl backdrop-blur-sm"
            />

            {/* Main content wrapper */}
            <div className="relative rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-950">
              <div className="p-6 sm:p-8">
                <ProfileForm initialData={profile as ProfileFormData} />
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </>
  );
}
