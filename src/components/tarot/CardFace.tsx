"use client";

import Image from "next/image";
import { useState } from "react";
import type { TarotCard as TarotCardType } from "@/types/tarot";

interface CardFaceProps {
  card?: TarotCardType;
  reversed?: boolean;
  back?: boolean;
  className?: string;
}

const MAJOR_ROMAN = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
];

const SUIT_LABEL: Record<string, string> = {
  wands: "权杖",
  cups: "圣杯",
  swords: "宝剑",
  pentacles: "星币",
  none: "",
};

function hasRasterArtwork(image?: string) {
  return Boolean(image?.match(/\.(png|jpe?g|webp|gif)(\?.*)?$/i));
}

function imageSrc(image: string) {
  return image.split("?")[0] ?? image;
}

function PlaceholderFace({
  card,
  reversed,
  className,
}: {
  card?: TarotCardType;
  reversed?: boolean;
  className?: string;
}) {
  const isLenormand = card?.system === "lenormand";
  const isMajor = card?.arcana === "major";
  const num = card?.number ?? 0;
  const topLabel = isLenormand
    ? "Lenormand"
    : isMajor
      ? "Major"
      : SUIT_LABEL[card?.suit ?? "none"] || card?.suit;
  const centerMark = isLenormand
    ? String(num)
    : isMajor
      ? (MAJOR_ROMAN[num] ?? String(num))
      : String(num);

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl ${className}`}
      style={{ transform: reversed ? "rotate(180deg)" : undefined }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1730] via-[#12101f] to-void" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(110,91,255,0.25) 0%, transparent 55%)",
        }}
      />
      <div className="absolute inset-2 rounded-lg border border-white/[0.1]" />
      <div className="relative flex h-full flex-col items-center justify-between p-4 text-center">
        <span className="text-[10px] tracking-[0.3em] text-accent/80 uppercase">
          {topLabel}
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-3xl font-light text-metal">
            {centerMark}
          </span>
          <span className="text-[10px] tracking-widest text-muted uppercase">
            {card?.nameEn}
          </span>
        </div>
        <div>
          <h4 className="font-display text-lg font-light tracking-wide text-frost">
            {card?.name}
          </h4>
        </div>
      </div>
    </div>
  );
}

export function CardFace({
  card,
  reversed = false,
  back = false,
  className = "",
}: CardFaceProps) {
  const [imgError, setImgError] = useState(false);

  if (back) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden rounded-xl ${className}`}
        style={{ transform: reversed ? "rotate(180deg)" : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-mystic via-surface to-void" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(110,91,255,0.4) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(74,108,247,0.2) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-3 rounded-lg border border-white/[0.08]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-sm" />
          <div className="absolute h-8 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent" />
          <div className="absolute h-px w-8 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        </div>
      </div>
    );
  }

  const showImage = card && hasRasterArtwork(card.image) && !imgError;

  if (showImage) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden rounded-xl ${
          card.system === "lenormand" ? "bg-[#f5f0e8]" : "bg-[#0a0a0f]"
        } ${className}`}
        style={{ transform: reversed ? "rotate(180deg)" : undefined }}
      >
        {card.system === "lenormand" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image}
            alt={card.name}
            className="absolute inset-0 h-full w-full object-contain object-center p-1.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <Image
            src={imageSrc(card.image)}
            alt={card.name}
            fill
            className="object-contain object-center p-1.5"
            sizes="(max-width: 768px) 140px, 260px"
            quality={92}
            onError={() => setImgError(true)}
          />
        )}
        <div
          className={`pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ${
            card.system === "lenormand" ? "ring-black/10" : "ring-white/[0.08]"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 ${
            card.system === "lenormand"
              ? "bg-gradient-to-t from-[#e8e0d4]/95 via-[#f5f0e8]/40 to-transparent"
              : "bg-gradient-to-t from-black/70 via-black/25 to-transparent"
          }`}
        >
          <p
            className={`text-center font-display text-sm font-light tracking-wide ${
              card.system === "lenormand" ? "text-[#2a2520]" : "text-frost"
            }`}
          >
            {card.name}
            {card.system === "lenormand" && (
              <span className="mt-0.5 block text-[10px] font-sans tracking-wide text-[#5c5348]">
                {card.number}. {card.nameEn}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return <PlaceholderFace card={card} reversed={reversed} className={className} />;
}
