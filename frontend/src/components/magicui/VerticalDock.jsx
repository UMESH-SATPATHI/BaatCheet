import React, { createContext, useContext, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "../../lib/utils";

const DEFAULT_MAGNIFICATION = 52;
const DEFAULT_DISTANCE = 120;
const DEFAULT_BASE_SIZE = 40;

const VerticalDockContext = createContext({
  mouseY: null,
  magnification: DEFAULT_MAGNIFICATION,
  distance: DEFAULT_DISTANCE,
  baseSize: DEFAULT_BASE_SIZE,
});

export function VerticalDock({
  children,
  className,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  baseSize = DEFAULT_BASE_SIZE,
  ...props
}) {
  const mouseY = useMotionValue(Infinity);

  return (
    <VerticalDockContext.Provider
      value={{ mouseY, magnification, distance, baseSize }}
    >
      <motion.nav
        onMouseMove={(e) => mouseY.set(e.clientY)}
        onMouseLeave={() => mouseY.set(Infinity)}
        className={cn(
          "flex flex-col items-center gap-2 w-full py-1",
          className
        )}
        {...props}
      >
        {children}
      </motion.nav>
    </VerticalDockContext.Provider>
  );
}

export function VerticalDockIcon({
  children,
  className,
  magnification: customMagnification,
  distance: customDistance,
  baseSize: customBaseSize,
  onClick,
  title,
  ...props
}) {
  const ref = useRef(null);
  const context = useContext(VerticalDockContext);

  const magnification = customMagnification ?? context.magnification;
  const distance = customDistance ?? context.distance;
  const baseSize = customBaseSize ?? context.baseSize;

  const distanceCalc = useTransform(context.mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const targetSize = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );

  const size = useSpring(targetSize, {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });

  // Calculate icon scaling ratio for content inside
  const scaleRatio = useTransform(size, (s) => s / baseSize);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onClick={onClick}
      title={title}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl cursor-pointer select-none transition-colors",
        className
      )}
      {...props}
    >
      <motion.div
        style={{ scale: scaleRatio }}
        className="flex items-center justify-center w-full h-full pointer-events-none"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
