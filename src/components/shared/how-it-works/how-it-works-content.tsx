"use client";

import { motion } from "framer-motion";
import { UserPlus, Heart, MessageCircle, Calendar } from "lucide-react";

export function HowItWorksContent() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            Find Your Valentine in 4 Easy Steps ✨
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            It&apos;s giving love at first swipe Here&apos;s how to get started 💖
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-pink-600/0 via-pink-600/50 to-pink-600/0 dark:from-pink-400/0 dark:via-pink-400/30 dark:to-pink-400/0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * index }}
              className={`relative flex items-center gap-8 mb-16 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div
                className={`w-1/2 ${
                  index % 2 === 0 ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`space-y-4 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}
                >
                  <div className="inline-flex items-center gap-2">
                    <step.icon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                  {step.tip && (
                    <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                      Pro tip: {step.tip} ✨
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 border-4 border-pink-600 dark:border-pink-400 flex items-center justify-center">
                <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                  {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Create Your Profile",
    description:
      "Sign up with your uni email, add your best pics (you know, the ones that make you look like a snack 🍪), and tell everyone what makes you special😉",
    tip: "Keep it real - authenticity is the new trend",
    icon: UserPlus,
  },
  {
    title: "Start Matching",
    description:
      "Swipe right on people who give you butterflies 🦋 Left if it's not your vibe. Our AI helps you find people who match your energy",
    tip: "Don't overthink it - trust your gut feeling",
    icon: Heart,
  },
  {
    title: "Slide Into DMs",
    description:
      "Matched? Time to bring your A-game Break the ice with a clever opener (no 'hey' allowed 🙅‍♂️). Show them your personality",
    tip: "Ask about something in their profile - it shows you paid attention",
    icon: MessageCircle,
  },
  {
    title: "Plan That Valentine's Date",
    description:
      "Found someone special? Take it to the next level! Plan a cute Valentine's date on campus or explore Glasgow together 🌹",
    tip: "Check out our Valentine's special events for date ideas",
    icon: Calendar,
  },
];
