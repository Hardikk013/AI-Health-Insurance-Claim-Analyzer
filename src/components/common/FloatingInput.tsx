import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(({
  label,
  error,
  helperText,
  rightIcon,
  onRightIconClick,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const reactId = React.useId();
  const inputId = id || `input-${reactId}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      <motion.div
        animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`relative rounded-2xl border-2 bg-surface px-4 pt-2.5 pb-2 transition-all ${
            error
              ? 'border-[#791F1F] bg-[#FCEBEB]/30'
              : isFocused
              ? 'border-teal ring-2 ring-teal/20 shadow-soft'
              : 'border-line hover:border-teal/50'
          }`}
        >
          {/* Label associated with input via htmlFor */}
          <label
            htmlFor={inputId}
            className={`block text-[11px] font-mono uppercase tracking-wider transition-colors duration-150 ${
              error
                ? 'text-[#791F1F] font-semibold'
                : isFocused
                ? 'text-teal font-semibold'
                : 'text-muted-foreground'
            }`}
          >
            {label}
          </label>

          {/* Input field + accessible right icon */}
          <div className="flex items-center justify-between gap-2">
            <input
              ref={ref}
              id={inputId}
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              onClick={(e) => {
                if (props.type === 'date') {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch {}
                }
                props.onClick?.(e);
              }}
              className={`w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted-foreground/60 placeholder:font-normal py-0.5 ${
                props.type === 'date' ? 'cursor-pointer' : ''
              }`}
              {...props}
            />
            {rightIcon && (
              onRightIconClick ? (
                <button
                  type="button"
                  onClick={onRightIconClick}
                  aria-label={`Open calendar for ${label}`}
                  className="shrink-0 text-muted-foreground hover:text-teal focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none rounded-lg p-1 transition-colors"
                >
                  {rightIcon}
                </button>
              ) : (
                <div aria-hidden="true" className="shrink-0 text-muted-foreground p-1">
                  {rightIcon}
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          id={errorId}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#791F1F] pl-2 font-medium"
        >
          {error}
        </motion.p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <p id={helperId} className="text-[11px] text-muted-foreground pl-2">
          {helperText}
        </p>
      )}
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';
