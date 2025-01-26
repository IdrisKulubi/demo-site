"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const createHeart = () => {
      const heart = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        scale: 0.5 + Math.random() * 0.5,
        duration: 10 + Math.random() * 20,
      };
      setHearts((prev) => [...prev, heart]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== heart.id));
      }, heart.duration * 1000);
    };

    const interval = setInterval(createHeart, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400/20 dark:text-pink-600/20"
          initial={{
            x: heart.x,
            y: window.innerHeight + 100,
            scale: heart.scale,
            rotate: -30 + Math.random() * 60,
          }}
          animate={{
            y: -100,
            rotate: -30 + Math.random() * 60,
          }}
          transition={{
            duration: heart.duration,
            ease: "linear",
          }}
          style={{ fontSize: "40px" }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}
