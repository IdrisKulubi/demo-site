import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MusicProvider } from "@/context/music-context";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import { constructMetadata } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/react";
import { SwipeCounterProvider } from "@/context/swipe-counter-context";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";


const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <MusicProvider>
              <SwipeCounterProvider>
                <div className="relative min-h-screen">
                  <Navbar />
                    <main className="flex-1">{children}</main>
                    <Analytics />
                    <Toaster />
                  </div>
              </SwipeCounterProvider>
            </MusicProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
