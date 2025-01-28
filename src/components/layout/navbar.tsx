"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { UserCircle, LogOut, Settings, User, Sparkles } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const showNavigation = pathname === "/";

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-colors"
          >
            Strathspace 💝
          </Link>

          {showNavigation && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                How It Works
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Explore Button - Only shown for signed in users and not on explore page */}
          {session?.user && pathname !== "/explore" && (
            <Button
              asChild
              variant="ghost"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 text-pink-600 dark:text-pink-400"
            >
              <Link href="/explore">
                <Sparkles className="h-4 w-4" />
                <span>Explore</span>
              </Link>
            </Button>
          )}

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || ""}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 border border-border bg-background/80 backdrop-blur-sm shadow-lg rounded-lg"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 hover:text-primary transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 hover:text-primary transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="gradient"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-colors"
            >
              <Link href="/login" className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
