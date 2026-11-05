// Central Motion Configuration for ClaimFight
// Easily tune animation timing, easings and motion variants in one place.

export const MOTION = {
  durations: {
    fast: 0.15,
    base: 0.3,
    slow: 0.6,
    scan: 3.0,
    gauge: 1.4,
  },
  easings: {
    easeOutCubic: [0.22, 1, 0.36, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
    spring: { type: 'spring', stiffness: 380, damping: 28 },
  },
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Framer Motion Variants

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: MOTION.durations.base, ease: MOTION.easings.easeOutCubic } 
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: MOTION.durations.base, ease: MOTION.easings.easeOutCubic } 
  },
};

export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

export const wordRevealItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.durations.base, ease: MOTION.easings.easeOutCubic },
  },
};

export const stepTransitionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: MOTION.durations.base, ease: MOTION.easings.easeOutCubic },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
    transition: { duration: MOTION.durations.fast, ease: MOTION.easings.easeInOut },
  }),
};
