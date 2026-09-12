import React from "react";
import { cn } from "../../lib/utils";

export default function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}) {
  return (
    <span
      style={{
        "--shiny-width": `${shimmerWidth}px`,
      }}
      className={cn(
        "inline-block bg-clip-text text-transparent bg-gradient-to-r from-zinc-300 via-white to-zinc-300 [background-size:var(--shiny-width)_100%] animate-shiny-text font-bold",
        className
      )}
    >
      {children}
    </span>
  );
}
