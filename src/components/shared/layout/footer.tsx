"use client";

import { motion } from "framer-motion";
import {  Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  {
    name: "GitHub",
    href: "/",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "/",
    icon: Twitter,
  },
  {
    name: "LinkedIn",
    href: "/",
    icon: Linkedin,
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 bg-gradient-to-t from-pink-50/50 to-transparent dark:from-pink-950/50 dark:to-transparent">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">Strathspace</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Making university connections more meaningful, one match at a
              time.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-pink-500"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Navigation</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {["Home", "About", "How it Works"].map((item) => (
                    <li key={item}>
                      <Link
                        href={`/${item.toLowerCase().replace(" ", "-")}`}
                        className="text-sm leading-6 text-muted-foreground hover:text-pink-500 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                    (item) => (
                      <li key={item}>
                        <Link
                          href={`/`}
                          className="text-sm leading-6 text-muted-foreground hover:text-pink-500 transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        
      </div>
    </footer>
  );
}
