import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-white/50 text-slate-900 border border-white/40 hover:bg-white/70 shadow-sm backdrop-blur-sm',
    ghost: 'bg-transparent hover:bg-white/30 text-slate-700 hover:text-slate-900',
    destructive: 'bg-red-500/90 text-white hover:bg-red-600 shadow-lg shadow-red-500/30',
    outline: 'border border-indigo-500/50 text-indigo-600 hover:bg-indigo-50/50',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md text-xs',
    lg: 'h-11 px-8 rounded-md text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
