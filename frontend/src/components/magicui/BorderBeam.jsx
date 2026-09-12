import React from "react";
import { cn } from "../../lib/utils";

export default function BorderBeam({
  className,
  size = 300,
  duration = 8,
  borderWidth = 2,
  colorFrom = "#8b5cf6",
  colorTo = "#22d3ee",
  delay = 0,
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20",
        className
      )}
      style={{
        padding: `${borderWidth}px`,
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        mask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
      }}
    >
      <div
        className="absolute inset-[-150%] animate-border-beam"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${colorFrom} 315deg, ${colorTo} 355deg, #ffffff 360deg)`,
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      />
    </div>
  );
}
