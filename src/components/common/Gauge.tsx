import React from 'react';
import { motion } from 'framer-motion';

interface GaugeProps {
  score?: number; // 0 to 100
  verdict?: 'grounds_to_contest' | 'insurer_appears_correct' | 'unclear' | 'not_supported' | string;
  size?: number;
  className?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  score = 85,
  verdict = 'grounds_to_contest',
  size = 160,
  className = '',
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  // Semi-circle arc
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  const isStrong = verdict === 'grounds_to_contest';
  const isWeak = verdict === 'insurer_appears_correct';

  const gaugeColor = isStrong ? '#1B7F7A' : isWeak ? '#791F1F' : '#F2A93B';
  const labelText = isStrong ? 'Strong' : isWeak ? 'Weak' : 'Medium';
  const statusBg = isStrong ? '#D9EFEA' : isWeak ? '#FCEBEB' : '#FAEEDA';
  const statusColor = isStrong ? '#085041' : isWeak ? '#791F1F' : '#633806';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Animated Fill Arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* Center Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center"
        >
          <span
            className="px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide"
            style={{ backgroundColor: statusBg, color: statusColor }}
          >
            {labelText}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
