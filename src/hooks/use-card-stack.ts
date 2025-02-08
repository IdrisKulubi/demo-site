import { useState, useCallback } from "react";
import { useSprings } from "@react-spring/web";
import { Profile } from "@/lib/types";

const ROTATION_RANGE = 25; // Increased rotation for more dramatic effect
const SWIPE_DISTANCE = window?.innerWidth || 600;

export function useCardStack(initialProfiles: Profile[]) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [isAnimating, setIsAnimating] = useState(false);

  const [springs, api] = useSprings(profiles.length, (i) => ({
    x: 0,
    y: 0,
    scale: 1 - i * 0.05, // Increased stack effect
    rot: 0,
    opacity: i < 3 ? 1 : 0,
    config: {
      mass: 1,
      tension: 200,
      friction: 20, // Reduced friction for more "fling" effect
      velocity: 0.5,
    },
  }));

  const swipe = useCallback(
    async (dir: "left" | "right") => {
      if (!profiles.length || isAnimating) return;

      setIsAnimating(true);
      api.start((i) => {
        if (i !== 0) {
          // Animate next card to come forward
          return {
            scale: 1 - (i - 1) * 0.05,
            y: 0,
            opacity: i < 3 ? 1 : 0,
            config: { tension: 200, friction: 20 },
          };
        }

        // Animate the top card
        return {
          x: dir === "right" ? SWIPE_DISTANCE : -SWIPE_DISTANCE,
          y: 100, // Add vertical movement for falling effect
          rot: dir === "right" ? ROTATION_RANGE : -ROTATION_RANGE,
          scale: 0.5, // Scale down as it flies away
          opacity: 0,
          config: {
            mass: 1,
            tension: 180,
            friction: 30,
            velocity: 2,
          },
          onRest: () => {
            setProfiles((prev) => prev.slice(1));
            setIsAnimating(false);
          },
        };
      });
    },
    [api, isAnimating, profiles.length]
  );

  return {
    springs,
    profiles,
    swipe,
    isAnimating,
    bind: useCallback(
      (i: number) => ({
        x: springs[i].x,
        y: springs[i].y,
        scale: springs[i].scale,
        rot: springs[i].rot,
        opacity: springs[i].opacity,
      }),
      [springs]
    ),
  };
}
