"use client";

import { motion } from "framer-motion";
import { Heart, Users, Sparkles, PartyPopper } from "lucide-react";

export function AboutContent() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-16"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-full bg-pink-100 dark:bg-pink-900/30"
          >
            <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          </motion.div>
          <h1 className="text-4xl font-bold">Not Your Average  App 💝</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            We&apos;re bringing the butterflies back to strathspace 🦋
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {aboutSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * index }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                <h2 className="text-2xl font-semibold">{section.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {section.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 bg-white/50 dark:bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm"
        >
          <PartyPopper className="h-12 w-12 mx-auto text-pink-600 dark:text-pink-400" />
          <h2 className="text-2xl font-bold">
            Ready to Find Your Match? 💘
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join hundreds of Strathspace students  already making meaningful
            connections. Whether you&apos;re looking for your soulmate or just want
            to meet new people, StrathSpace is your go-to spot
            🌟
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

const aboutSections = [
  {
    title: "For Students, By Students",
    description:
      "Created exclusively for students community. We get it - finding your perfect match on campus can be tough. That's why we've made it fun, safe, and totally stress-free! 🎓",
    icon: Users,
  },
  {
    title: "More Than Just Swipes",
    description:
      "Forget boring profiles Show off your vibe with photos, interests, and what makes you uniquely you. Plus, our smart matching helps you find people who actually get your humor 😊",
    icon: Sparkles,
  },
  {
    title: "Special Events",
    description:
      "Join our exciting community events and mixers! From ice-breakers to fun activities, we create opportunities for meaningful connections and friendships to blossom naturally 🌟",
    icon: Heart,
  },
];
