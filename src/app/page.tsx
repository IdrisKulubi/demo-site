import { LandingContent } from "@/components/landing/landing-content";
import { AboutContent } from "@/components/about/about-content";
import { HowItWorksContent } from "@/components/how-it-works/how-it-works-content";
import { FloatingHearts } from "@/components/ui/floating-hearts";
import { Scene3DWrapper } from "@/components/3d/scene-wrapper";
import { AnimatedSection } from "@/components/sections/animated-section";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-pink-950 dark:to-background overflow-x-hidden">
      <Scene3DWrapper />
      <FloatingHearts />
      {/* Content sections */}
      <section id="hero" className="relative">
        <LandingContent />
      </section>
      <AnimatedSection id="how-it-works">
        <HowItWorksContent />
      </AnimatedSection>

      <AnimatedSection id="about">
        <AboutContent />
      </AnimatedSection>
    </main>
  );
}
