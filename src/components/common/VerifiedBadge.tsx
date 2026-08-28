import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle' | 'pill';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  text = 'Terverifikasi',
  size = 'md',
  variant = 'pill',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.75 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1 gap-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  if (variant === 'subtle') {
    return (
      <span
        id="badge-verified-subtle"
        className={`inline-flex items-center text-purple-600 bg-purple-50 rounded-md border border-purple-100/80 ${sizeClasses[size]} ${className}`}
      >
        <ShieldCheck size={iconSizes[size]} className="text-purple-600 shrink-0 fill-purple-100" />
        <span className="leading-none whitespace-nowrap">{text}</span>
      </span>
    );
  }

  if (variant === 'solid') {
    return (
      <span
        id="badge-verified-solid"
        className={`inline-flex items-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-sm shadow-purple-500/20 ${sizeClasses[size]} ${className}`}
      >
        <ShieldCheck size={iconSizes[size]} className="shrink-0" />
        <span className="leading-none whitespace-nowrap">{text}</span>
      </span>
    );
  }

  // Pill variant (Default - elegant, soft purple/pink trust accent)
  return (
    <span
      id="badge-verified-pill"
      className={`inline-flex items-center text-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 rounded-full shadow-xs ${sizeClasses[size]} ${className}`}
    >
      <div className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
        ✓
      </div>
      <span className="leading-none whitespace-nowrap font-medium">{text}</span>
    </span>
  );
};
