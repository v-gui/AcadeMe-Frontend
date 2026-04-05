import React from 'react';
import { Icon } from './Icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'search' | 'add' | 'check';
  compact?: boolean;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'search',
  compact = false,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-gray-200 bg-white/70 ${compact ? 'p-8' : 'p-10'} ${className}`}
    >
      <Icon iconCenter={icon} className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} mb-3 text-[#003465] opacity-50`} />
      <p className="text-[#003465] font-black text-xs uppercase tracking-widest">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-xs text-gray-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
