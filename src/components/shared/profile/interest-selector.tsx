"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { interests } from "@/lib/constants";



export function InterestSelector({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (interests: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {interests.map((interest) => (
        <motion.button
          key={interest}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const newInterests = value.includes(interest)
              ? value.filter((i) => i !== interest)
              : [...value, interest];
            onChange(newInterests);
          }}
          className={cn(
            "relative p-3 rounded-lg text-sm flex items-center gap-2",
            "border border-pink-200 dark:border-pink-800",
            value.includes(interest)
              ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
              : "bg-background hover:bg-pink-50 dark:hover:bg-pink-950"
          )}
        >
          {value.includes(interest) && (
            <Check className="w-4 h-4 text-pink-500" />
          )}
          {interest}
        </motion.button>
      ))}
    </div>
  );
}
