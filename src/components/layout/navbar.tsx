"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "How it Works", path: "/how-it-works" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b bg-white/50 backdrop-blur-sm dark:bg-background/50"
    >
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400 fill-current" />
            <span className="text-xl font-bold text-pink-600 dark:text-pink-400">
              StrathSpace
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-pink-600 dark:hover:text-pink-400",
                  pathname === item.path
                    ? "text-pink-600 dark:text-pink-400"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
                {pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-pink-600 dark:bg-pink-400"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
