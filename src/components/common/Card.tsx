import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  hoverLift?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverLift = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -6, borderColor: 'var(--teal)', boxShadow: '0 12px 28px rgba(18,48,46,0.06)' } : {}}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-line bg-surface p-6 transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
