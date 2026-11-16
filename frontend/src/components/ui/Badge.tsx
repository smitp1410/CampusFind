import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lost' | 'found' | 'open' | 'matched' | 'claimed' | 'resolved' | 'closed' | 'strong' | 'possible' | 'low' | 'neutral' | 'pending' | 'verified' | 'approved' | 'rejected';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-mono font-medium uppercase tracking-wider border select-none';

  const variants = {
    lost: 'bg-campus-forest text-campus-ivory border-campus-forest',
    found: 'bg-campus-charcoal text-campus-lime border-campus-charcoal',
    open: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    pending: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
    verified: 'bg-emerald-100 text-emerald-950 border-emerald-500 font-bold',
    approved: 'bg-emerald-100 text-emerald-950 border-emerald-500 font-bold',
    rejected: 'bg-red-100 text-red-900 border-red-400 font-bold',
    matched: 'bg-campus-lime/30 text-campus-charcoal border-campus-lime font-bold',
    claimed: 'bg-amber-50 text-amber-900 border-amber-300',
    resolved: 'bg-teal-900 text-campus-lime border-teal-800 font-semibold',
    closed: 'bg-campus-grey text-stone-600 border-stone-300',
    strong: 'bg-campus-lime text-campus-charcoal border-campus-charcoal font-bold shadow-[2px_2px_0px_#1B211F]',
    possible: 'bg-campus-sage/40 text-campus-charcoal border-campus-charcoal/40 font-medium',
    low: 'bg-campus-grey text-stone-600 border-stone-300',
    neutral: 'bg-campus-ivory text-campus-charcoal border-campus-charcoal/20',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
