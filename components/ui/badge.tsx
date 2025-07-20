import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Badge component variants using B2B Shipping Design System
 * Supports semantic colors and professional styling
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-smooth overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring',
        destructive:
          'border-transparent bg-error text-error-foreground hover:bg-error/90 focus-visible:ring-error',
        success:
          'border-transparent bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning',
        info:
          'border-transparent bg-info text-info-foreground hover:bg-info/90 focus-visible:ring-info',
        error:
          'border-transparent bg-error text-error-foreground hover:bg-error/90 focus-visible:ring-error',
        outline:
          'text-foreground border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px] rounded',
        md: 'px-2 py-0.5 text-xs rounded-md',
        lg: 'px-3 py-1 text-sm rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';

    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
