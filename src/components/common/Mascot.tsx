import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type MascotMood = 'idle' | 'thinking' | 'happy';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  showNote?: boolean;
  noteText?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'idle',
  size = 140,
  className = '',
  showNote = false,
  noteText = "hi, I'm your claim buddy",
}) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (mood !== 'idle') return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4500);
    return () => clearInterval(interval);
  }, [mood]);

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Handwritten Note & Drawn Arrow */}
      {showNote && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute -top-12 -left-20 sm:-left-24 z-10 flex items-center gap-1 font-handwriting text-xl text-teal -rotate-6 pointer-events-none"
        >
          <span>{noteText}</span>
          <svg width="40" height="28" viewBox="0 0 40 28" fill="none" className="text-teal">
            <motion.path
              d="M4 22 C14 26, 26 22, 34 8 M34 8 L24 8 M34 8 L32 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      )}

      {/* Shield Body with Motion Float */}
      <motion.svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={
          mood === 'idle'
            ? { y: [0, -6, 0] }
            : mood === 'thinking'
            ? { rotate: [-1, 1, -1] }
            : { y: [0, -8, 0], scale: [1, 1.04, 1] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === 'idle' ? 4 : mood === 'thinking' ? 2 : 1.5,
          ease: 'easeInOut',
        }}
        className="drop-shadow-sm"
      >
        {/* Thinking Bubbles */}
        {mood === 'thinking' && (
          <g>
            <motion.circle
              cx="74"
              cy="16"
              r="3"
              fill="#1B7F7A"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
            />
            <motion.circle
              cx="84"
              cy="10"
              r="4.5"
              fill="#1B7F7A"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            />
            <motion.circle
              cx="95"
              cy="4"
              r="6"
              fill="#1B7F7A"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            />
          </g>
        )}

        {/* Shield Contour */}
        <path
          d="M50 4 C72 4 88 12 88 32 C88 64 68 88 50 106 C32 88 12 64 12 32 C12 12 28 4 50 4 Z"
          fill="#D9EFEA"
          stroke="#12302E"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Small Document Held on Right (Optional) */}
        <g transform="translate(62, 52) rotate(12)">
          <rect
            x="0"
            y="0"
            width="18"
            height="24"
            rx="2.5"
            fill="#FFFFFF"
            stroke="#12302E"
            strokeWidth="1.8"
          />
          <line x1="4" y1="6" x2="14" y2="6" stroke="#1B7F7A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="11" x2="14" y2="11" stroke="#9AA8A4" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="16" x2="11" y2="16" stroke="#9AA8A4" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Eyes */}
        {blink ? (
          <g stroke="#12302E" strokeWidth="2.8" strokeLinecap="round">
            <line x1="36" y1="44" x2="44" y2="44" />
            <line x1="56" y1="44" x2="64" y2="44" />
          </g>
        ) : mood === 'thinking' ? (
          <g>
            <circle cx="40" cy="40" r="3.2" fill="#12302E" />
            <circle cx="60" cy="40" r="3.2" fill="#12302E" />
            {/* Highlights looking up */}
            <circle cx="41.5" cy="38.5" r="1.2" fill="#FFFFFF" />
            <circle cx="61.5" cy="38.5" r="1.2" fill="#FFFFFF" />
          </g>
        ) : (
          <g>
            <circle cx="40" cy="44" r="3.2" fill="#12302E" />
            <circle cx="60" cy="44" r="3.2" fill="#12302E" />
            <circle cx="41.2" cy="42.8" r="1.2" fill="#FFFFFF" />
            <circle cx="61.2" cy="42.8" r="1.2" fill="#FFFFFF" />
          </g>
        )}

        {/* Smile / Mouth */}
        {mood === 'happy' ? (
          <path
            d="M40 56 Q50 66 60 56"
            stroke="#12302E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="#FFFFFF"
          />
        ) : mood === 'thinking' ? (
          <ellipse cx="50" cy="56" rx="2.5" ry="3" fill="#12302E" />
        ) : (
          <path
            d="M43 55 Q50 61 57 55"
            stroke="#12302E"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Rosy Cheeks */}
        <circle cx="32" cy="51" r="2.8" fill="#F2A93B" opacity="0.45" />
        <circle cx="68" cy="51" r="2.8" fill="#F2A93B" opacity="0.45" />
      </motion.svg>
    </div>
  );
};
