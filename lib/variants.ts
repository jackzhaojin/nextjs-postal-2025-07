import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { designSystem } from "./design-system";

/**
 * Utility function to merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Component variant utilities for consistent styling
 */

// Size variant utilities
export const getSizeClasses = (size: keyof typeof designSystem.componentSizes = 'md') => {
  const sizeConfig = designSystem.componentSizes[size];
  return cn(
    sizeConfig.padding,
    sizeConfig.text,
    sizeConfig.radius,
    sizeConfig.minHeight
  );
};

// Button variant utilities
export const getButtonClasses = (
  variant: keyof typeof designSystem.buttonVariants = 'solid',
  color: keyof typeof designSystem.buttonVariants.solid = 'primary',
  size: keyof typeof designSystem.componentSizes = 'md',
  disabled: boolean = false,
  loading: boolean = false
) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-smooth',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    getSizeClasses(size)
  );
  
  const variantClasses = designSystem.buttonVariants[variant][color];
  
  const stateClasses = cn(
    disabled && designSystem.componentStates.disabled,
    loading && designSystem.componentStates.loading
  );
  
  return cn(baseClasses, variantClasses, stateClasses);
};

// Card variant utilities
export const getCardClasses = (
  variant: keyof typeof designSystem.cardVariants = 'elevated',
  padding: boolean = true
) => {
  const baseClasses = designSystem.cardVariants[variant];
  const paddingClasses = padding ? 'p-6' : '';
  
  return cn(baseClasses, paddingClasses);
};

// Input variant utilities
export const getInputClasses = (
  hasError: boolean = false,
  disabled: boolean = false,
  size: keyof typeof designSystem.componentSizes = 'md'
) => {
  const baseClasses = cn(
    'flex w-full rounded-lg border border-input bg-background px-3 py-2',
    'text-base ring-offset-background file:border-0 file:bg-transparent',
    'file:text-sm file:font-medium placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    designSystem.transitions.smooth
  );
  
  const sizeClasses = getSizeClasses(size);
  
  const stateClasses = cn(
    hasError && designSystem.componentStates.error,
    disabled && designSystem.componentStates.disabled
  );
  
  return cn(baseClasses, sizeClasses, stateClasses);
};

// Alert variant utilities
export const getAlertClasses = (
  variant: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  const baseClasses = cn(
    'relative w-full rounded-lg border px-4 py-3 text-sm',
    '[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
    '[&>svg]:text-foreground [&>svg~*]:pl-7'
  );
  
  const variantClasses = {
    info: 'border-info/20 bg-info/10 text-info-foreground [&>svg]:text-info',
    success: 'border-success/20 bg-success/10 text-success-foreground [&>svg]:text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning-foreground [&>svg]:text-warning',
    error: 'border-error/20 bg-error/10 text-error-foreground [&>svg]:text-error',
  };
  
  return cn(baseClasses, variantClasses[variant]);
};

// Badge variant utilities
export const getBadgeClasses = (
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  const baseClasses = cn(
    'inline-flex items-center rounded-full border font-semibold transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  );
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const variantClasses = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
    warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
    error: 'border-transparent bg-error text-error-foreground hover:bg-error/80',
    outline: 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
  };
  
  return cn(baseClasses, sizeClasses[size], variantClasses[variant]);
};

// Loading spinner utilities
export const getLoadingSpinnerClasses = (
  size: 'sm' | 'md' | 'lg' = 'md',
  color: 'primary' | 'white' | 'current' = 'primary'
) => {
  const baseClasses = 'animate-spin rounded-full border-2 border-solid border-r-transparent';
  
  const sizeClasses = {
    sm: 'h-4 w-4 border-[1.5px]',
    md: 'h-6 w-6',
    lg: 'h-8 w-8 border-[3px]',
  };
  
  const colorClasses = {
    primary: 'border-primary border-r-transparent',
    white: 'border-white border-r-transparent',
    current: 'border-current border-r-transparent',
  };
  
  return cn(baseClasses, sizeClasses[size], colorClasses[color]);
};

// Progress bar utilities
export const getProgressBarClasses = (
  variant: 'default' | 'success' | 'warning' | 'error' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  const containerClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };
  
  return {
    container: cn(
      'relative w-full overflow-hidden rounded-full bg-secondary',
      containerClasses[size]
    ),
    bar: cn(
      'h-full w-full flex-1 transition-all rounded-full',
      variantClasses[variant]
    ),
  };
};

// Form field group utilities
export const getFormFieldClasses = () => {
  return {
    group: 'space-y-2',
    label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    description: 'text-sm text-muted-foreground',
    error: 'text-sm font-medium text-error',
  };
};

// Container utilities
export const getContainerClasses = (
  maxWidth: keyof typeof designSystem.containers = 'responsive',
  padding: boolean = true
) => {
  const baseClasses = 'mx-auto';
  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';
  const maxWidthClass = `max-w-[${designSystem.containers[maxWidth]}]`;
  
  return cn(baseClasses, paddingClasses, maxWidthClass);
};

// Responsive text utilities
export const getResponsiveTextClasses = (
  size: 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base'
) => {
  const responsiveClasses = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl lg:text-2xl',
    xl: 'text-xl sm:text-2xl lg:text-3xl',
    '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
  };
  
  return responsiveClasses[size];
};

// Focus ring utilities
export const getFocusRingClasses = (color: 'primary' | 'success' | 'warning' | 'error' = 'primary') => {
  const colorClasses = {
    primary: 'focus-visible:ring-primary',
    success: 'focus-visible:ring-success',
    warning: 'focus-visible:ring-warning',
    error: 'focus-visible:ring-error',
  };
  
  return cn(
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    colorClasses[color]
  );
};

// Export all utility functions
export const variants = {
  getSizeClasses,
  getButtonClasses,
  getCardClasses,
  getInputClasses,
  getAlertClasses,
  getBadgeClasses,
  getLoadingSpinnerClasses,
  getProgressBarClasses,
  getFormFieldClasses,
  getContainerClasses,
  getResponsiveTextClasses,
  getFocusRingClasses,
};

export default variants;
