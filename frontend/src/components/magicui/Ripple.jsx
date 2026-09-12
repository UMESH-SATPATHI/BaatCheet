import React from "react";
import { cn } from "../../lib/utils";

export default function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 6,
  className,
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(mainCircleOpacity - i * 0.035, 0.03);
        const animationDelay = `${i * 0.2}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";

        return (
          <div
            key={i}
            className="animate-ripple absolute rounded-full border border-purple-500/40 bg-purple-500/5 shadow-[0_0_16px_rgba(139,92,246,0.15)]"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: "1px",
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
