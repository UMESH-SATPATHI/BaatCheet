import React, { useRef, useState, useCallback } from "react";
import { cn } from "../../lib/utils";

export default function MagicCard({
  children,
  className,
  gradientSize = 320,
  gradientColor = "rgba(139, 92, 246, 0.28)",
  gradientOpacity = 1,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -gradientSize, y: -gradientSize });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [gradientSize]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: -gradientSize, y: -gradientSize });
  }, [gradientSize]);

  return (
    <section
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[rgba(22,22,28,0.75)] p-7 sm:p-9 text-center shadow-2xl backdrop-blur-xl transition-all duration-300",
        className
      )}
      style={{
        boxShadow:
          "0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px -10px rgba(139, 92, 246, 0.2)",
        ...style,
      }}
      {...props}
    >
      {/* 1. Ambient Breathing Glowing Orbs inside Card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-purple-600/30 via-indigo-500/20 to-cyan-400/15 blur-3xl animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-700/25 via-purple-500/15 to-transparent blur-3xl opacity-70"
      />

      {/* 2. Interactive Cursor-Tracking Spotlight Orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? gradientOpacity : 0,
          background: `radial-gradient(${gradientSize}px circle at ${mousePos.x}px ${mousePos.y}px, ${gradientColor}, transparent 80%)`,
        }}
      />

      {/* 3. Subtle Interactive Border Shine on Hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl border border-purple-500/30 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 0.9 : 0,
          maskImage: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
        }}
      />

      {/* 4. Card Children */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
