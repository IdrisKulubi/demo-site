"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const listener = () => {
      // Use setTimeout to prevent frequent updates during orientation changes
      setTimeout(() => setMatches(media.matches), 100);
    };

    media.addEventListener("change", listener);
    listener(); // Initial check
    
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
