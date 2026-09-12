import React from "react";
import { cn } from "../../lib/utils";

export default function ShimmerButton({
  shimmerColor = "#ffffff",
  shimmerSize = "0.08em",
  borderRadius = "16px",
  shimmerDuration = "3s",
  background = "rgba(139, 92, 246, 0.15)",
  className,
  children,
  ...props
}) {
  return (
    <button
      style={{
        "--spread": "90deg",
        "--shimmer-color": shimmerColor,
        "--radius": borderRadius,
        "--speed": shimmerDuration,
        "--cut": shimmerSize,
        "--bg": background,
      }}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-purple-500/30 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/60 hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {/* Spark container */}
      <div
        className={cn(
          "-z-30 blur-[2px]",
          "absolute inset-0 overflow-visible [container-type:size]"
        )}
      >
        {/* Spark */}
        <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          {/* Spark before */}
          <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      {children}

      {/* Highlight overlay */}
      <div
        className={cn(
          "insert-0 absolute size-full",
          "rounded-[inherit] px-4 py-1.5 text-sm font-medium",
          "transform-gpu transition-all duration-300 ease-in-out",
          "group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.12)]",
          "group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.2)]"
        )}
      />

      {/* Backdrop */}
      <div
        className={cn(
          "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]"
        )}
      />
    </button>
  );
}
