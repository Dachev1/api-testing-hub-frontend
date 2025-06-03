import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:translate-y-0',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'text-primary-foreground shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-primary to-purple-500',
        'gradient-success': 'text-success-foreground shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-success to-emerald-400',
        'gradient-destructive': 'text-destructive-foreground shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-destructive to-pink-500',
        'gradient-secondary': 'text-secondary-foreground shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-secondary to-violet-400',
        glass: 'backdrop-blur-md bg-white/10 border border-white/20 shadow-sm text-white hover:bg-white/20 hover:shadow hover:-translate-y-0.5 active:translate-y-0',
        neumorphic: 'neumorphic text-foreground hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, loading = false, children, disabled, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 