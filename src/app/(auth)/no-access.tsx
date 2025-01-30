import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-background rounded-xl shadow-lg space-y-6">
        <div className="space-y-2">
          <div className="text-6xl animate-bounce">💔</div>
          <h1 className="text-2xl font-bold text-pink-500">Oops, We Broke Up 💔</h1>
          <p className="text-lg text-muted-foreground">
            We can&apos;t afford to be with everyone, sorry not sorry 💸, I am saving for my valentine 💘, just hang around we will be open to all byeee 👋
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            As a small indie dev, we can&apos;t incur the cost of serving everyone. 💸And some of you are already misbehaving.
            <span className="block mt-2">
              We&apos;re keeping it exclusive to Strathmore University students only 🎉
            </span>
          </p>

          <p className="text-sm text-muted-foreground">
            If you&apos;re a Strathmore student, make sure to sign in with your
            <span className="font-semibold"> @strathmore.edu </span>
            email.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/login">
              Try Again with Strathmore Email
            </Link>
          </Button>
        </div>

        <div className="pt-6 text-center text-sm text-muted-foreground">
          <p className="font-medium tracking-wide">
            ✨ Approved by vehem23 ⚡️
          </p>
          <p className="text-xs opacity-70 mt-1">
            🚀 The Gatekeeper of Cool 🎭
          </p>
        </div>
      </div>
    </div>
  );
}
