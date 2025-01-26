"use client";

import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SwipeInterface() {
  return (
    <div className="flex justify-center gap-6">
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full border-2 border-pink-200 hover:border-pink-500 hover:bg-pink-50 dark:border-pink-800 dark:hover:border-pink-600 dark:hover:bg-pink-950"
        onClick={() => console.log("Pass")}
      >
        <X className="h-6 w-6 text-pink-600 dark:text-pink-400" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full border-2 border-pink-200 hover:border-pink-500 hover:bg-pink-50 dark:border-pink-800 dark:hover:border-pink-600 dark:hover:bg-pink-950"
        onClick={() => console.log("Like")}
      >
        <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
      </Button>
    </div>
  );
}
