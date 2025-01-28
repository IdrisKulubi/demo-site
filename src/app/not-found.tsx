import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background">
      <div className="container max-w-4xl mx-auto px-4 pt-32 pb-12 text-center">
        <div className="space-y-8">
          {/* 404 text */}
          <div className="relative inline-block">
            <div className="text-[8rem] font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              4😿4
            </div>
            <div className="absolute -top-8 -right-12 text-6xl animate-bounce">
              🚫💔
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Oopsie! Page ghosted you 💔 Just kidding,we are working on this
            feature🧑‍💻
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            This link must be in its ~toxic era~ 🌸✨
          </p>

          {/* Back home button */}
          <div className="transition-transform hover:scale-105 active:scale-95">
            <Button
              asChild
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 text-lg py-6 px-8 rounded-2xl"
            >
              <Link href="/" className="flex items-center gap-2">
                🏠 Take me back to the main stage 👈
              </Link>
            </Button>
          </div>

          {/* Decorative elements */}
          <div
            aria-hidden="true"
            className="absolute -bottom-32 left-1/4 text-pink-500/10 text-9xl select-none"
          >
            🌸
          </div>
          <div
            aria-hidden="true"
            className="absolute -top-20 right-1/4 text-pink-500/10 text-8xl select-none rotate-12"
          >
            ✨
          </div>
        </div>
      </div>
    </div>
  );
}
