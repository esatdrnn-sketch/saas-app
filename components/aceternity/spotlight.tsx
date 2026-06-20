"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

/** Aceternity UI tarzı spotlight arka plan efekti. */
export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute -top-40 left-0 z-0 h-[28rem] w-[28rem] md:-top-20 md:left-20",
        className
      )}
    >
      <svg
        className="absolute h-full w-full animate-pulse"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 3787 2842"
        fill="none"
      >
        <g filter="url(#spotlight-filter)">
          <ellipse
            cx="1924.71"
            cy="273.501"
            rx="1924.71"
            ry="273.501"
            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
            fill={fill}
            fillOpacity="0.21"
          />
        </g>
        <defs>
          <filter
            id="spotlight-filter"
            x="0.860352"
            y="0.838989"
            width="3785.16"
            height="2840.26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="151"
              result="effect1_foregroundBlur"
            />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}
