"use client";

import { Heart, ArrowRight, Shield, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    title: "Verified Users",
    description: "Connect with verified Strathspace students only",
    icon: Shield,
  },
  {
    title: "Smart Matching",
    description: "Find matches based on interests and courses",
    icon: Sparkles,
  },
  {
    title: "Safe & Secure",
    description: "Your privacy and security are our top priority",
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
            Find Your Perfect Match at{" "}
            <span className="text-pink-600 dark:text-pink-400">
              StrathSpace
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Connect with fellow students, share moments, and discover meaningful
            relationships in a safe and trusted environment.
          </p>
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
