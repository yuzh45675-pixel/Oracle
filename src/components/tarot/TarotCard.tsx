"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { CardFace } from "./CardFace";
import type { TarotCard as TarotCardType } from "@/types/tarot";

interface TarotCardProps {
  card?: TarotCardType;
  reversed?: boolean;
  flipped?: boolean;
  settled?: boolean;
  onFlip?: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "hero";
  interactive?: boolean;
  className?: string;
  delay?: number;
}

const sizes = {
  xs: "h-[108px] w-[74px]",
  sm: "h-[140px] w-[96px]",
  md: "h-[200px] w-[136px]",
  lg: "h-[280px] w-[190px]",
  hero: "h-[220px] w-[152px] sm:h-[280px] sm:w-[190px] md:h-[380px] md:w-[260px]",
};

export function TarotCard({
  card,
  reversed = false,
  flipped: controlledFlipped,
  settled = false,
  onFlip,
  size = "md",
  interactive = true,
  className = "",
  delay = 0,
}: TarotCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = controlledFlipped ?? internalFlipped;
  const isLocked = settled || flipped;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const canInteract = interactive && !isLocked;

  const handleFlip = () => {
    if (!canInteract) return;
    if (onFlip) onFlip();
    else setInternalFlipped((f) => !f);
  };

  return (
    <motion.div
      className={`perspective-[1200px] ${sizes[size]} ${className}`}
      style={{ perspective: 1200 }}
      initial={isLocked ? false : { opacity: 0, y: 30, scale: 0.95 }}
      animate={isLocked ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={
        isLocked
          ? undefined
          : {
              delay,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }
      }
      onMouseMove={
        canInteract
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              x.set((e.clientX - rect.left) / rect.width - 0.5);
              y.set((e.clientY - rect.top) / rect.height - 0.5);
            }
          : undefined
      }
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        className={`relative h-full w-full ${canInteract ? "cursor-pointer" : "cursor-default"}`}
        style={
          isLocked
            ? { transformStyle: "preserve-3d" }
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={handleFlip}
        whileHover={canInteract ? { scale: 1.02 } : {}}
      >
        <motion.div
          className="absolute inset-0 shadow-card transition-shadow duration-500"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardFace back />
        </motion.div>
        <motion.div
          className="absolute inset-0 shadow-card"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardFace card={card} reversed={reversed} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
