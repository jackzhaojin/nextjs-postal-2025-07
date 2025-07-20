import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Button component variants using B2B Shipping Design System
 * Supports multiple style variants, semantic colors, and touch-friendly sizing
 */
const buttonVariants = cva(
  // Base styles with accessibility and professional appearance
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-smooth disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        // Solid variants - Primary actions
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-600 focus-visible:ring-primary',
        destructive: 'bg-error text-error-foreground shadow-sm hover:bg-error/90 focus-visible:ring-error',
        success: 'bg-success text-success-foreground shadow-sm hover:bg-success/90 focus-visible:ring-success',
        warning: 'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90 focus-visible:ring-warning',
        info: 'bg-info text-info-foreground shadow-sm hover:bg-info/90 focus-visible:ring-info',
        
        // Outline variants - Secondary actions
        outline: 'border border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary',
        'outline-destructive': 'border border-error text-error bg-background hover:bg-error hover:text-error-foreground focus-visible:ring-error',
        'outline-success': 'border border-success text-success bg-background hover:bg-success hover:text-success-foreground focus-visible:ring-success',
        'outline-warning': 'border border-warning text-warning bg-background hover:bg-warning hover:text-warning-foreground focus-visible:ring-warning',
        'outline-info': 'border border-info text-info bg-background hover:bg-info hover:text-info-foreground focus-visible:ring-info',
        
        // Ghost variants - Subtle actions
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-ring',
        ghost: 'text-primary hover:bg-primary-50 hover:text-primary-600 focus-visible:ring-primary',
        'ghost-destructive': 'text-error hover:bg-error/10 hover:text-error focus-visible:ring-error',
        'ghost-success': 'text-success hover:bg-success/10 hover:text-success focus-visible:ring-success',
        'ghost-warning': 'text-warning hover:bg-warning/10 hover:text-warning focus-visible:ring-warning',
        'ghost-info': 'text-info hover:bg-info/10 hover:text-info focus-visible:ring-info',
        
        // Link variant - Text-based actions
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary p-0 h-auto',
      },
      size: {
        // Touch-friendly sizes following design system
        sm: 'h-8 px-3 py-1.5 text-sm rounded-md gap-1.5 min-w-[2rem]',
        md: 'h-11 px-4 py-2 text-base rounded-lg gap-2 min-w-[2.75rem]', // Default touch-friendly 44px height
        lg: 'h-12 px-6 py-3 text-lg rounded-xl gap-2 min-w-[3rem]',
        xl: 'h-14 px-8 py-4 text-xl rounded-2xl gap-3 min-w-[3.5rem]',
        
        // Icon-only buttons
        'icon-sm': 'h-8 w-8 p-0 rounded-md',
        'icon-md': 'h-11 w-11 p-0 rounded-lg', // Touch-friendly icon button
        'icon-lg': 'h-12 w-12 p-0 rounded-xl',
        'icon-xl': 'h-14 w-14 p-0 rounded-2xl',
      },
      loading: {
        true: 'cursor-wait opacity-75',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Show loading state
    const isDisabled = disabled || loading;
    const content = loading && loadingText ? loadingText : children;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        data-loading={loading}
        {...props}
      >
        {asChild ? (
          content
        ) : (
          <>
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {content}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
