import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg',
        secondary:
          'bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:shadow-md hover:brightness-105',
        outline:
          'border border-border bg-transparent hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-sm',
        ghost: 'hover:bg-muted hover:text-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // Shows a spinner and blocks repeat clicks while an action is in progress
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          {size !== 'icon' && children}
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        </>
      ) : (
        children
      )}
    </button>
  );
}
