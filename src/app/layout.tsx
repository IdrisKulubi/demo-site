import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MusicProvider } from "@/context/music-context";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/explore/mobile/mobile-nav";
import { constructMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <MusicProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar className="hidden md:flex" />{" "}
                {/* Show Navbar on medium and larger screens */}
                <MobileNav className="flex md:hidden" />{" "}
                {/* Show MobileNav on small screens */}
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </MusicProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
