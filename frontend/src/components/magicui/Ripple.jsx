import React from "react";
import { cn } from "../../lib/utils";

export default function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.28,
  numCircles = 8,
  className,
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [mask-image:radial-gradient(circle_at_center,white_35%,transparent_82%)]",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 85;
        const opacity = Math.max(mainCircleOpacity - i * 0.03, 0.04);
        const animationDelay = `${i * 0.22}s`;
        const borderStyle = i % 2 === 1 ? "dashed" : "solid";

        return (
          <div
            key={i}
            className="animate-ripple absolute rounded-full border border-purple-500/35 bg-purple-500/5 shadow-[0_0_25px_rgba(139,92,246,0.16)]"
            style={{
              "--base-opacity": opacity,
              "--i": i,
              "--duration": "3s",
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: "1.5px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
            }}
          />
        );
      })}
    </div>
  );
}
