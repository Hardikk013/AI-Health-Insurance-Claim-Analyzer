import React from 'react';

export type TagVariant = 'strong' | 'medium' | 'weak' | 'info' | 'mono';

interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'strong',
  children,
  className = '',
  icon,
}) => {
  if (variant === 'mono') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono-code text-[11px] text-muted-foreground tracking-wider uppercase ${className}`}>
        {icon}
        <span>{children}</span>
      </span>
    );
  }

  const variantStyles = {
    strong: 'bg-[#D9EFEA] text-[#085041] border-[#B2DFD6]',
    medium: 'bg-[#FAEEDA] text-[#633806] border-[#F2D7AE]',
    weak: 'bg-[#FCEBEB] text-[#791F1F] border-[#F8C8C8]',
    info: 'bg-[#E6F1FB] text-[#0C447C] border-[#BED9F3]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
