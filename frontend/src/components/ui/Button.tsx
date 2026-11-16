import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'lime' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const variants = {
    primary: 'bg-campus-charcoal text-campus-ivory hover:bg-campus-forest shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]',
    lime: 'bg-campus-lime text-campus-charcoal font-semibold hover:bg-campus-lime-hover shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]',
    secondary: 'bg-campus-white text-campus-charcoal border border-campus-charcoal hover:bg-campus-grey shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
    outline: 'border border-campus-charcoal/30 bg-transparent text-campus-charcoal hover:border-campus-charcoal hover:bg-campus-white/60',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
    ghost: 'bg-transparent text-campus-charcoal hover:bg-campus-charcoal/5',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 uppercase tracking-wider',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5 tracking-wide',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
