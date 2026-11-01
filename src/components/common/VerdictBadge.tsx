import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { VerdictType } from '../../types';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ 
  verdict, 
  size = 'md',
  showSubtitle = false
}) => {
  const configs = {
    grounds_to_contest: {
      label: 'Grounds to contest',
      subtitle: 'The repudiation contradicts policy terms or IRDAI rules',
      bgClass: 'bg-success-soft text-success border-success/30',
      icon: CheckCircle2,
      iconClass: 'text-success'
    },
    insurer_appears_correct: {
      label: 'Insurer appears correct',
      subtitle: 'The policy terms support the exclusion',
      bgClass: 'bg-danger-soft text-danger border-danger/30',
      icon: XCircle,
      iconClass: 'text-danger'
    },
    unclear: {
      label: 'Unclear: Needs info',
      subtitle: 'Key dates or records missing',
      bgClass: 'bg-warning-soft text-warning-foreground border-warning/30',
      icon: AlertTriangle,
      iconClass: 'text-warning-foreground'
    },
    not_supported: {
      label: 'Not yet supported',
      subtitle: 'Refer to Ombudsman guidelines',
      bgClass: 'bg-muted text-muted-foreground border-border',
      icon: HelpCircle,
      iconClass: 'text-muted-foreground'
    }
  };

  const current = configs[verdict] || configs.unclear;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1 gap-2',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4.5'
  };

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center font-medium rounded-full border shadow-2xs ${sizeClasses[size]} ${current.bgClass}`}
      >
        <Icon className={`${iconSizes[size]} ${current.iconClass} shrink-0`} />
        <span>{current.label}</span>
      </span>
      {showSubtitle && (
        <span className="text-xs text-muted-foreground mt-0.5 ml-1">{current.subtitle}</span>
      )}
    </div>
  );
};
