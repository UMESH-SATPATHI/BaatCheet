import React from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export default function InteractiveHoverButton({
  children,
  text = "Continue with Google",
  icon,
  loading = false,
  disabled = false,
  className,
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-purple-500/40 bg-[#161622]/90 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 hover:border-purple-400 hover:shadow-purple-900/50 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {/* Expanding Interactive Orb / Color Flood on Hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#8b5cf6] transition-all duration-500 ease-out group-hover:scale-[70] group-hover:bg-[#8b5cf6]"
      />

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-2.5 transition-all duration-300 group-hover:translate-x-0.5">
        {loading ? (
          <>
            <LoaderCircle
              className="h-5 w-5 animate-spin text-white"
              aria-label="Redirecting"
            />
            <span className="font-semibold tracking-wide text-white">
              Redirecting...
            </span>
          </>
        ) : (
          <>
            {/* Optional Custom Icon (e.g. Google SVG) */}
            {icon && <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>}

            {/* Main Button Text */}
            <span className="font-semibold tracking-wide text-white">
              {children || text}
            </span>

            {/* Hover Slide-in Arrow Icon */}
            <ArrowRight className="h-4 w-4 text-white opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
          </>
        )}
      </div>
    </button>
  );
}
