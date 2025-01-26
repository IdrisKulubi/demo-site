"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";

interface BioInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BioInput({ value, onChange, error }: BioInputProps) {
  const [wordCount, setWordCount] = useState(
    value?.split(/\s+/).filter(Boolean).length || 0
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setWordCount(newValue.split(/\s+/).filter(Boolean).length);
  };

  const getEmoji = () => {
    if (wordCount === 0) return "✨";
    if (wordCount < 5) return "💭";
    if (wordCount < 10) return "✍️";
    return "💝";
  };

  const getMessage = () => {
    if (wordCount === 0) return "Time to shine bestie Tell your story ✨";
    if (wordCount < 5) return "Keep going Make it personal 💫";
    if (wordCount < 10) return "Almost there A few more words 🌟";
    return " Your bio is giving main character energy ✨";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="relative">
        <Textarea
          placeholder="What makes you uniquely you? Share your vibe, your passions, or your best dad joke 🦋"
          value={value}
          onChange={handleChange}
          className={`min-h-[120px] resize-none bg-pink-50/50 dark:bg-pink-950/50 
            border-pink-200 dark:border-pink-800 focus:border-pink-300 
            dark:focus:border-pink-700 placeholder:text-muted-foreground`}
        />
        <motion.div
          initial={false}
          animate={{
            scale: wordCount >= 10 ? [1, 1.2, 1] : 1,
            rotate: wordCount >= 10 ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 0.5 }}
          className="absolute right-3 top-3"
        >
          {wordCount >= 10 ? (
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          ) : (
            <Sparkles className="w-5 h-5 text-pink-400" />
          )}
        </motion.div>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <p>{getMessage()}</p>
        <p className={`${wordCount >= 10 ? "text-pink-500" : ""}`}>
          {getEmoji()} {wordCount}/10 words
        </p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
