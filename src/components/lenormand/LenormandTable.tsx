"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";

interface LenormandTableProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  enablePan?: boolean;
}

export function LenormandTable({
  children,
  className = "",
  style,
  enablePan = false,
}: LenormandTableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enablePan) return;
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    ref.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: start.current.ox + (e.clientX - start.current.x),
      y: start.current.oy + (e.clientY - start.current.y),
    });
  };

  const onPointerUp = () => setDragging(false);

  return (
    <div
      ref={ref}
      className={`relative mx-auto overflow-hidden rounded-3xl border border-white/[0.06] ${className}`}
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 45%, rgba(35,30,55,0.45) 0%, rgba(8,8,12,0.92) 70%)",
        boxShadow:
          "0 24px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="relative h-full w-full"
        style={{
          transform: enablePan
            ? `translate(${offset.x}px, ${offset.y}px)`
            : undefined,
          cursor: enablePan ? (dragging ? "grabbing" : "grab") : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
