"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getTotalSwipes } from "@/lib/actions/explore.actions";

interface SwipeCounterContextType {
  swipeCount: number;
  incrementSwipeCount: () => void;
  resetSwipeCount: () => void;
}

const SwipeCounterContext = createContext<SwipeCounterContextType | undefined>(undefined);

export function SwipeCounterProvider({ children }: { children: ReactNode }) {
  const [swipeCount, setSwipeCount] = useState(0);

  // Fetch initial swipe count and set up polling
  useEffect(() => {
    const fetchSwipeCount = async () => {
      const result = await getTotalSwipes();
      if (result.success) {
        setSwipeCount(result.count);
      }
    };

    // Fetch immediately
    fetchSwipeCount();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchSwipeCount, 5000);

    return () => clearInterval(interval);
  }, []);

  const incrementSwipeCount = () => {
    setSwipeCount(prev => prev + 1);
  };

  const resetSwipeCount = () => {
    setSwipeCount(0);
  };

  return (
    <SwipeCounterContext.Provider value={{ swipeCount, incrementSwipeCount, resetSwipeCount }}>
      {children}
    </SwipeCounterContext.Provider>
  );
}

export function useSwipeCounter() {
  const context = useContext(SwipeCounterContext);
  if (context === undefined) {
    throw new Error("useSwipeCounter must be used within a SwipeCounterProvider");
  }
  return context;
}
