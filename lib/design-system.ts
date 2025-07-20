/**
 * B2B Shipping Design System
 * Centralized design tokens and utilities for consistent UI implementation
 */

// Color System
export const colors = {
  // Primary Colors - Professional Blue Palette
  primary: {
    50: 'oklch(0.975 0.01 264)',
    100: 'oklch(0.94 0.025 264)',
    200: 'oklch(0.88 0.04 264)',
    300: 'oklch(0.77 0.06 264)',
    400: 'oklch(0.615 0.08 264)',
    500: 'oklch(0.5 0.1 264)',
    600: 'oklch(0.4 0.12 264)',
    700: 'oklch(0.346 0.08 264)', // Main brand color
    800: 'oklch(0.285 0.06 264)',
    900: 'oklch(0.22 0.04 264)',
    950: 'oklch(0.145 0.02 264)',
  },
  
  // Semantic Colors
  semantic: {
    success: 'oklch(0.5 0.13 142)',
    warning: 'oklch(0.7 0.15 85)',
    error: 'oklch(0.55 0.2 25)',
    info: 'oklch(0.55 0.15 230)',
  },
  
  // Neutral Grays
  gray: {
    50: 'oklch(0.985 0 0)',
    100: 'oklch(0.97 0 0)',
    200: 'oklch(0.922 0 0)',
    300: 'oklch(0.86 0 0)',
    400: 'oklch(0.708 0 0)',
    500: 'oklch(0.556 0 0)',
    600: 'oklch(0.45 0 0)',
    700: 'oklch(0.35 0 0)',
    800: 'oklch(0.269 0 0)',
    900: 'oklch(0.205 0 0)',
    950: 'oklch(0.145 0 0)',
  },
} as const;

// Typography System
export const typography = {
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'Menlo', 'Monaco', 'monospace'],
    display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Spacing System (4px base unit)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px - Touch target minimum
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

// Responsive Breakpoints
export const breakpoints = {
  sm: '640px',   // Mobile: 0-640px
  md: '768px',   // Tablet: 641-1024px  
  lg: '1024px',  // Desktop: 1025px+
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Container Max Widths
export const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  narrow: '768px',
  wide: '1536px',
  responsive: '1280px',
} as const;

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  '3xl': 'calc(var(--radius) + 12px)',
  full: '9999px',
} as const;

// Shadow System (Elevation levels)
export const shadows = {
  none: '0 0 #0000',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Component Size Variants
export const componentSizes = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    radius: 'rounded-md',
    minHeight: 'min-h-8',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    radius: 'rounded-lg',
    minHeight: 'min-h-11', // Touch-friendly
  },
  lg: {
    padding: 'px-6 py-3',
    text: 'text-lg',
    radius: 'rounded-xl',
    minHeight: 'min-h-12',
  },
  xl: {
    padding: 'px-8 py-4',
    text: 'text-xl',
    radius: 'rounded-2xl',
    minHeight: 'min-h-14',
  },
} as const;

// Button Style Variants
export const buttonVariants = {
  solid: {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    success: 'bg-success text-success-foreground shadow-sm hover:bg-success/90',
    warning: 'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90',
    error: 'bg-error text-error-foreground shadow-sm hover:bg-error/90',
    info: 'bg-info text-info-foreground shadow-sm hover:bg-info/90',
  },
  outline: {
    primary: 'border border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    success: 'border border-success text-success bg-background hover:bg-success hover:text-success-foreground',
    warning: 'border border-warning text-warning bg-background hover:bg-warning hover:text-warning-foreground',
    error: 'border border-error text-error bg-background hover:bg-error hover:text-error-foreground',
    info: 'border border-info text-info bg-background hover:bg-info hover:text-info-foreground',
  },
  ghost: {
    primary: 'text-primary hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    success: 'text-success hover:bg-success/10 hover:text-success',
    warning: 'text-warning hover:bg-warning/10 hover:text-warning',
    error: 'text-error hover:bg-error/10 hover:text-error',
    info: 'text-info hover:bg-info/10 hover:text-info',
  },
  link: {
    primary: 'text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    success: 'text-success underline-offset-4 hover:underline',
    warning: 'text-warning underline-offset-4 hover:underline',
    error: 'text-error underline-offset-4 hover:underline',
    info: 'text-info underline-offset-4 hover:underline',
  },
} as const;

// Card Style Variants
export const cardVariants = {
  elevated: 'bg-card border border-border shadow-lg rounded-lg',
  outlined: 'bg-card border-2 border-border rounded-lg',
  flat: 'bg-card rounded-lg',
} as const;

// Component States
export const componentStates = {
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  loading: 'opacity-75 cursor-wait',
  selected: 'ring-2 ring-primary ring-offset-2',
  error: 'border-error ring-2 ring-error ring-offset-2',
  success: 'border-success ring-2 ring-success ring-offset-2',
} as const;

// Animation Durations
export const animations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Transition Utilities
export const transitions = {
  smooth: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
} as const;

// Touch Target Minimum (WCAG compliance)
export const touchTarget = {
  minimum: '44px', // WCAG AA minimum
  comfortable: '48px', // More comfortable for mobile
} as const;

// Z-index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
} as const;

// Design System Helper Functions
export const designSystem = {
  colors,
  typography,
  spacing,
  breakpoints,
  containers,
  borderRadius,
  shadows,
  componentSizes,
  buttonVariants,
  cardVariants,
  componentStates,
  animations,
  transitions,
  touchTarget,
  zIndex,
} as const;

export default designSystem;
