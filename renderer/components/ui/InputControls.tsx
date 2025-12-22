'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      icon,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 gap-2';

    const variants = {
      primary: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500',
      secondary: 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700',
      danger: 'bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600/20',
      ghost: 'text-gray-500 hover:text-white hover:bg-gray-800'
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-xl',
      md: 'px-6 py-3.5 text-sm rounded-2xl',
      lg: 'px-8 py-4 text-base rounded-[20px]'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}>
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  desc?: string;
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, desc, prefixIcon, suffix, className = '', ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!);

    const handlePrefixClick = () => {
      if (internalRef.current) {
        if (props.type === 'date' || props.type === 'datetime-local' || props.type === 'time') {
          try {
            (internalRef.current as any).showPicker();
          } catch (e) {
            internalRef.current.focus();
            internalRef.current.click();
          }
        } else {
          internalRef.current.focus();
        }
      }
    };

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {prefixIcon && (
            <div
              onClick={handlePrefixClick}
              className={`
                absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 
                transition-colors z-10 
                ${
                  props.type === 'date' || props.type === 'datetime-local'
                    ? 'cursor-pointer hover:text-blue-400'
                    : 'pointer-events-none'
                }
              `}>
              {prefixIcon}
            </div>
          )}
          <input
            ref={internalRef}
            className={`
              w-full bg-gray-950 border border-gray-800 rounded-2xl py-3.5 text-sm font-bold 
              focus:ring-2 focus:ring-blue-500/40 outline-none transition-all placeholder-gray-800
              ${prefixIcon ? 'pl-12' : 'px-5'}
              ${suffix ? 'pr-16' : 'pr-5'}
              ${error ? 'border-rose-500/50 ring-rose-500/20' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
              {suffix}
            </div>
          )}
        </div>
        {desc && !error && (
          <p className="text-[10px] font-medium text-gray-600 pl-1 leading-relaxed">{desc}</p>
        )}
        {error && <p className="text-[10px] font-bold text-rose-500 pl-1">{error}</p>}
      </div>
    );
  }
);
