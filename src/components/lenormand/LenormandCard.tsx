"use client";

import { TarotCard } from "@/components/tarot/TarotCard";
import type { TarotCard as TarotCardType } from "@/types/tarot";

interface LenormandCardProps {
  card: TarotCardType;
  flipped?: boolean;
  settled?: boolean;
  onFlip?: () => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  highlighted?: boolean;
}

export function LenormandCard({
  card,
  flipped = false,
  settled = false,
  onFlip,
  size = "md",
  interactive = false,
  highlighted = false,
}: LenormandCardProps) {
  return (
    <div
      className={`rounded-lg transition-shadow ${
        highlighted
          ? "ring-2 ring-accent/50 ring-offset-2 ring-offset-void"
          : ""
      }`}
    >
      <TarotCard
        card={card}
        reversed={false}
        flipped={flipped}
        settled={settled}
        onFlip={onFlip}
        size={size}
        interactive={interactive}
      />
    </div>
  );
}
