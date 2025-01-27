"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BioInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function BioInput({ value, onChange }: BioInputProps) {
  const [wordCount, setWordCount] = useState(
    () => value?.split(/\s+/).length || 0
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setWordCount(newValue.split(/\s+/).filter(Boolean).length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label className="text-base">Tell everyone about yourself! 💫</Label>
        <Textarea
          placeholder="I'm a fun-loving student who..."
          className="h-32 resize-none bg-pink-50/50 dark:bg-pink-950/50 border-pink-200"
          value={value}
          onChange={handleChange}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Min. 10 words</span>
          <motion.span
            animate={{
              color: wordCount >= 10 ? "#10b981" : "#6b7280",
            }}
          >
            {wordCount} words {wordCount >= 10 && "✨"}
          </motion.span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Pro tip: Be authentic and let your personality shine! 🌟
      </p>
    </motion.div>
  );
}
