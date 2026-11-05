import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (variant === 'primary') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 500);
    }

    onClick?.(e);
  };

  const sizeClasses = 
    size === 'sm' ? 'px-4 h-9 text-xs font-semibold' : 
    size === 'lg' ? 'px-7 h-13 text-base font-bold' : 
    'px-6 h-11 text-sm font-semibold';

  if (variant === 'tertiary') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`group inline-flex items-center justify-center gap-1.5 font-medium text-foreground hover:text-teal focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        } ${className}`}
        {...props}
      >
        <span className="relative pb-0.5">
          {children}
          <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-teal transition-all duration-300 group-hover:w-full" />
        </span>
        {showArrow && (
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        )}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`relative inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-ink text-ink bg-surface font-semibold transition-all duration-200 shadow-[0_3px_0_0_#12302E] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#12302E] active:translate-y-[3px] active:shadow-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-[#12302E] focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">Processing...</span>
          </>
        ) : (
          <>
            <span className="flex items-center justify-center gap-2">{children}</span>
            {showArrow && <ArrowRight className="size-4" aria-hidden="true" />}
          </>
        )}
      </motion.button>
    );
  }

  // Primary Button with real physical 3D depth, bold text, and centered alignment
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B7F7A] text-white font-bold tracking-wide transition-all duration-200 shadow-[0_4px_0_0_#0f5350] hover:shadow-[0_2px_0_0_#0f5350] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-[#1B7F7A] focus-visible:outline-none group cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${className}`}
      {...props}
    >
      {/* Ripple effect */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            left: r.x - 12,
            top: r.y - 12,
            width: 24,
            height: 24,
          }}
        />
      ))}

      {/* Centered label and optional single arrow */}
      <span className="relative z-10 flex items-center justify-center gap-2 text-center w-full">
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin text-white" aria-hidden="true" />
            <span className="sr-only">Processing...</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            {showArrow && (
              <ArrowRight className="size-4.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            )}
          </>
        )}
      </span>
    </motion.button>
  );
};
