import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating Meme Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float-hearts text-pink-500/10 text-${Math.random() > 0.5 ? '4xl' : '2xl'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          >
            {Math.random() > 0.5 ? '🤑' : '🤡'}
          </div>
        ))}
      </div>

      <div className="max-w-md w-full p-8 bg-white/80 dark:bg-background/80 backdrop-blur-sm rounded-xl shadow-lg space-y-6 relative animate-fade-in">
        {/* Top Corner Emojis */}
        <div className="absolute -top-4 -right-4 text-2xl animate-pulse">💸</div>
        <div className="absolute -top-4 -left-4 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>🚷</div>

        <div className="space-y-2">
          <div className="text-6xl animate-heartbeat text-center">🙅♂️💸</div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-400 text-center animate-gradient">
            Yikes, It&apos;s Not You - It&apos;s My Wallet 💸
          </h1>
          <p className="text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Server costs got me acting broke AF 😬 Saving my coins for that Valentine&apos;s date incase i find a match, You do you boo, we&apos;ll maybe vibe later ✌️
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Look, between us - some of y&apos;all are wildin&apos; out here 🤡 We got clowns trying to host entire dating sims in the DMs 🎪 
            <span className="block mt-2 text-pink-500 dark:text-pink-400 font-medium">
              Strathmore gang only rn - no randos allowed 🚫
            </span>
          </p>

          <p className="text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.6s' }}>
            PSST! If you&apos;re Strathmore fam: <br/>
            <span className="font-semibold bg-gradient-to-r from-pink-500 to-rose-400 text-transparent bg-clip-text">
              Use your @strathmore.edu email sis
            </span>
            <br/>
            (Don&apos;t make me call campus security 🚔)
          </p>
        </div>

        <div className="pt-4 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <Button 
            asChild 
            variant="secondary" 
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/login">
              Try Again (This Time Read the Memo) 👀
            </Link>
          </Button>
        </div>

        <div className="pt-6 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '1s' }}>
          <p className="font-medium tracking-wide bg-gradient-to-r from-pink-500 to-rose-400 text-transparent bg-clip-text">
            ✨ Approved by vehem23, the broke king 👑
          </p>
          <p className="text-xs opacity-70 mt-1">
            🚀 Out here fighting server fires daily 🔥
          </p>
        </div>

        {/* Bottom Corner Emojis */}
        <div className="absolute -bottom-4 -right-4 text-2xl animate-pulse" style={{ animationDelay: '0.75s' }}>🧑💻</div>
        <div className="absolute -bottom-4 -left-4 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>📉</div>
      </div>
    </div>
  );
}