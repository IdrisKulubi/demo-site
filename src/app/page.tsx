import { LandingContent } from "@/components/shared/landing/landing-content";
import { AboutContent } from "@/components/shared/about/about-content";
import { HowItWorksContent } from "@/components/shared/how-it-works/how-it-works-content";
import { FloatingHearts } from "@/components/ui/floating-hearts";
import { Scene3DWrapper } from "@/components/shared/3d/scene-wrapper";
import { AnimatedSection } from "@/components/shared/sections/animated-section";
import { Footer } from "@/components/shared/layout/footer";
import { checkProfileCompletion } from "@/lib/checks";
import { redirect } from "next/navigation";

export default async function Home() {
  const { hasProfile, isComplete } = await checkProfileCompletion();

  // Redirect logged-in users with incomplete profiles
  if (hasProfile && !isComplete) {
    redirect("/profile/setup");
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-pink-950 dark:to-background overflow-x-hidden">
      {/* <GenderUpdateNotification /> */}
      <Scene3DWrapper />
      <FloatingHearts />
      {/* Content sections */}
      <section id="hero" className="relative">
        <LandingContent />
      </section>

      <div className="h-32" />

      <AnimatedSection id="how-it-works">
        <HowItWorksContent />
      </AnimatedSection>

      <div className="h-32" />

      <AnimatedSection id="about">
        <AboutContent />
      </AnimatedSection>
      <Footer />
    </main>
  );
}
