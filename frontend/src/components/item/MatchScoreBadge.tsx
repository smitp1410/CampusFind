import React from 'react';
import { Sparkles } from 'lucide-react';
import { MatchClassification } from '../../types';

interface MatchScoreBadgeProps {
  score: number;
  classification?: MatchClassification | string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  classification,
  size = 'md',
  showDetails = true,
}) => {
  const getBadgeStyle = () => {
    if (score >= 80) {
      return 'bg-campus-lime text-campus-charcoal border-campus-charcoal font-bold shadow-[2px_2px_0px_#1B211F]';
    } else if (score >= 50) {
      return 'bg-campus-sage text-campus-charcoal border-campus-charcoal/40 font-semibold';
    } else {
      return 'bg-campus-grey text-campus-charcoal/70 border-campus-charcoal/20';
    }
  };

  const getLabel = () => {
    if (score >= 80) return 'Strong Match';
    if (score >= 50) return 'Possible Match';
    return 'Low Match';
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2',
  };

  return (
    <div
      className={`inline-flex items-center font-mono border uppercase tracking-wider select-none ${getBadgeStyle()} ${sizeClasses[size]}`}
      title={`Calculated 6-factor smart match score: ${score}%`}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{Math.round(score)}%</span>
      {showDetails && (
        <span className="font-sans font-medium text-[9px] sm:text-[11px] normal-case opacity-90 pl-1 border-l border-current">
          {classification ? classification : getLabel()}
        </span>
      )}
    </div>
  );
};
