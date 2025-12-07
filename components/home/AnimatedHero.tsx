"use client";

import { motion } from "motion/react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import HeroCTA from "./HeroCTA";

// Clean basketball - orange with curved lines
function Basketball({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#F97316" />
      <circle cx="50" cy="50" r="48" fill="url(#basketballGradient)" />
      <path d="M 50 2 L 50 98" stroke="#1a1a1a" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M 2 50 L 98 50" stroke="#1a1a1a" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M 15 15 Q 50 40 85 15" stroke="#1a1a1a" strokeWidth="2" strokeOpacity="0.3" fill="none" />
      <path d="M 15 85 Q 50 60 85 85" stroke="#1a1a1a" strokeWidth="2" strokeOpacity="0.3" fill="none" />
      <defs>
        <radialGradient id="basketballGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Clean baseball - white with red stitches
function Baseball({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#F5F5F4" />
      <circle cx="50" cy="50" r="48" fill="url(#baseballGradient)" />
      <path
        d="M 25 20 Q 15 50 25 80"
        stroke="#DC2626"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 75 20 Q 85 50 75 80"
        stroke="#DC2626"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round">
        <line x1="22" y1="25" x2="28" y2="28" />
        <line x1="20" y1="35" x2="26" y2="36" />
        <line x1="19" y1="45" x2="25" y2="45" />
        <line x1="19" y1="55" x2="25" y2="55" />
        <line x1="20" y1="65" x2="26" y2="64" />
        <line x1="22" y1="75" x2="28" y2="72" />
        <line x1="78" y1="25" x2="72" y2="28" />
        <line x1="80" y1="35" x2="74" y2="36" />
        <line x1="81" y1="45" x2="75" y2="45" />
        <line x1="81" y1="55" x2="75" y2="55" />
        <line x1="80" y1="65" x2="74" y2="64" />
        <line x1="78" y1="75" x2="72" y2="72" />
      </g>
      <defs>
        <radialGradient id="baseballGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E7E5E4" stopOpacity="0.3" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function FloatingBall({
  children,
  size,
  initialX,
  initialY,
  delay,
}: {
  children: React.ReactNode;
  size: number;
  initialX: string;
  initialY: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: initialX,
        top: initialY,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, 0.25, 0.25, 0],
        y: [0, -12, 0, 12, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        duration: 14,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedHero() {
  return (
    <section className="relative bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-20 pb-32 overflow-hidden">
      {/* Background sports balls - z-0 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <FloatingBall size={100} initialX="5%" initialY="12%" delay={0}>
          <Basketball className="w-full h-full drop-shadow-md" />
        </FloatingBall>

        <FloatingBall size={70} initialX="88%" initialY="10%" delay={3}>
          <Baseball className="w-full h-full drop-shadow-md" />
        </FloatingBall>

        <FloatingBall size={85} initialX="78%" initialY="58%" delay={5}>
          <Basketball className="w-full h-full drop-shadow-md" />
        </FloatingBall>

        <FloatingBall size={75} initialX="6%" initialY="62%" delay={2}>
          <Baseball className="w-full h-full drop-shadow-md" />
        </FloatingBall>
      </div>

      {/* Main content - z-10 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm"
          >
            <TrophyIcon className="w-4 h-4" />
            <span>NFL, NBA, MLB, NHL & Big Ten</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Watch Games Together,
            </motion.span>
            <br />
            <motion.span
              className="text-blue-600 dark:text-blue-400 inline-block"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                type: "spring",
                stiffness: 100,
              }}
            >
              But No Spoilers
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Share real-time reactions with friends and family while watching at
            different times. Messages reveal only when you reach that
            moment—just like watching together on the couch.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <HeroCTA />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white dark:from-gray-950 to-transparent z-10" />
    </section>
  );
}
