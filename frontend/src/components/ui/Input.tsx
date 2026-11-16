import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal/80"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campus-charcoal/50">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-campus-white border border-campus-charcoal/40 text-campus-charcoal placeholder-campus-charcoal/40 text-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:border-campus-charcoal focus:ring-1 focus:ring-campus-charcoal ${
              leftIcon ? 'pl-10' : ''
            } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-mono">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-campus-charcoal/60 font-mono">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block mb-1.5 text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal/80"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full bg-campus-white border border-campus-charcoal/40 text-campus-charcoal placeholder-campus-charcoal/40 text-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:border-campus-charcoal focus:ring-1 focus:ring-campus-charcoal ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          rows={props.rows || 3}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-mono">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-campus-charcoal/60 font-mono">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
