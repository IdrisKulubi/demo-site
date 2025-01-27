"use client";

import { Heart, ArrowRight, Shield, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    title: "Valentine's Ready",
    description:
      "Find your perfect match before the big day Special Valentine's events and ice-breakers included 💝",
    icon: Shield,
  },
  {
    title: "Vibe Check",
    description:
      "Our AI helps you find people who match your energy! No awkward convos, just genuine connections ✨",
    icon: Sparkles,
  },
  {
    title: "Safe Space",
    description:
      "Verified uni students only Your safety is our top priority, bestie 🔒",
    icon: Lock,
  },
];

export function LandingContent() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Heart className="h-16 w-16 text-pink-600 dark:text-pink-400 fill-current" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100">
            Find Your Valentine at{" "}
            <span className="text-pink-600 dark:text-pink-400">
              Strathspace
            </span>{" "}
            <span className="inline-block animate-bounce">💘</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Don&apos;t let this Valentine&apos;s be another Netflix and chill alone! Join
            StrathSpace and find someone who matches your vibe before February
            14th! 🌹✨
          </p>
          <div className="flex justify-center gap-2 text-pink-600 dark:text-pink-400">
            <span className="animate-pulse">❤️</span>
            <span className="animate-pulse delay-100">💖</span>
            <span className="animate-pulse delay-200">💝</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 w-full sm:w-auto"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="border-pink-200 hover:border-pink-300 dark:border-pink-800 dark:hover:border-pink-700 w-full sm:w-auto"
            >
              How it Works
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2 }}
              className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-pink-100 dark:border-pink-900"
            >
              <feature.icon className="h-8 w-8 text-pink-600 dark:text-pink-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
