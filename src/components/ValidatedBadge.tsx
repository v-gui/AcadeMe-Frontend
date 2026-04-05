import React from 'react';
import { FaCheck } from 'react-icons/fa';

interface ValidatedBadgeProps {
  compact?: boolean;
}

const ValidatedBadge: React.FC<ValidatedBadgeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm"
        title="Projeto validado por professor"
      >
        <FaCheck className="h-2.5 w-2.5" />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-green-700"
      title="Projeto validado por professor"
    >
      <FaCheck className="h-2.5 w-2.5" />
      Validado
    </span>
  );
};

export default ValidatedBadge;
