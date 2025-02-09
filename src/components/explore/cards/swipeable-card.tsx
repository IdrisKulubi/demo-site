"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Profile } from "@/db/schema";
import { Card } from "@/components/ui/card";
import ImageSlider from "../controls/ImageSlider";


interface SwipeableCardProps {
  profile: Profile & {
    photos?: string[];
  };
  onSwipe: (direction: "left" | "right") => void;
  onRevert?: () => void;
  active: boolean;
}

export function SwipeableCard({
  profile,
  onSwipe,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRevert,
  active,
}: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Transform values for PASS/LIKE text
  const leftTextOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  const rightTextOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const textScale = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [1.5, 1.2, 1, 1.2, 1.5]
  );

  useEffect(() => {
    if (!active) return;

    const unsubscribe = x.on("change", (latest) => {
      if (latest <= -200) {
        setExitX(-400);
        onSwipe("left");
      } else if (latest >= 200) {
        setExitX(400);
        onSwipe("right");
      }
    });

    return () => unsubscribe();
  }, [active, onSwipe, x]);

  if (!active) {
    return null;
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent,
    info: { offset: { x: number } }
  ) => {
    if (info.offset.x < -200) {
      animate(x, -400);
      onSwipe("left");
    } else if (info.offset.x > 200) {
      animate(x, 400);
      onSwipe("right");
    } else {
      animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 20,
      });
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: "spring", damping: 40, stiffness: 400 }}
      className="touch-none"
    >
      <Card className="relative w-full h-full overflow-hidden rounded-3xl aspect-[3/4]">
        <div className="absolute inset-0 p-2">
          <ImageSlider
            slug={[
              profile.profilePhoto || "",
              ...(profile.photos || []),
            ].filter(Boolean)}
            className="h-full"
          />
        </div>

        {/* PASS Text */}
        <motion.div
          style={{ opacity: leftTextOpacity, scale: textScale }}
          className="absolute top-8 left-8 rotate-[-12deg] pointer-events-none z-10"
        >
          <span className="font-graffiti text-4xl text-red-500 drop-shadow-lg">
            PASS
          </span>
        </motion.div>

        {/* LIKE Text */}
        <motion.div
          style={{ opacity: rightTextOpacity, scale: textScale }}
          className="absolute top-8 right-8 rotate-[12deg] pointer-events-none z-10"
        >
          <span className="font-graffiti text-4xl text-green-500 drop-shadow-lg">
            LIKE
          </span>
        </motion.div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white z-10">
          <h3 className="text-2xl font-bold">
            {profile.firstName}, {profile.yearOfStudy}
          </h3>
          <p className="text-sm opacity-90">{profile.course}</p>
          <p className="mt-2 text-sm opacity-80 line-clamp-2">{profile.bio}</p>
        </div>

       
      </Card>
    </motion.div>
  );
}
