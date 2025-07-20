/**
 * Design System Showcase Page
 * Demonstrates all design system components, variants, and patterns
 * for the B2B Shipping system
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Icons for demonstration
const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Color palette display component
const ColorPalette = ({ title, colors }: { title: string; colors: Record<string, string> }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {Object.entries(colors).map(([name, value]) => (
        <div key={name} className="space-y-2">
          <div 
            className="h-16 w-full rounded-lg border shadow-sm"
            style={{ backgroundColor: value.replace('var(--', '').replace(')', '') }}
          />
          <div className="text-xs space-y-1">
            <div className="font-medium">{name}</div>
            <div className="text-muted-foreground font-mono text-[10px]">{value}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Typography showcase component
const TypographyShowcase = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Typography Scale</h3>
    <div className="space-y-4">
      <div className="text-9xl font-bold">9xl Heading</div>
      <div className="text-8xl font-bold">8xl Heading</div>
      <div className="text-7xl font-bold">7xl Heading</div>
      <div className="text-6xl font-bold">6xl Heading</div>
      <div className="text-5xl font-bold">5xl Heading</div>
      <div className="text-4xl font-bold">4xl Heading</div>
      <div className="text-3xl font-semibold">3xl Heading</div>
      <div className="text-2xl font-semibold">2xl Heading</div>
      <div className="text-xl font-semibold">XL Heading</div>
      <div className="text-lg font-semibold">Large Heading</div>
      <div className="text-base font-medium">Base Text</div>
      <div className="text-sm">Small Text</div>
      <div className="text-xs">Extra Small Text</div>
    </div>
    
    <Separator className="my-8" />
    
    <div className="space-y-4">
      <h4 className="text-base font-semibold">Font Weights</h4>
      <div className="space-y-2">
        <div className="text-lg font-normal">Normal Weight (400)</div>
        <div className="text-lg font-medium">Medium Weight (500)</div>
        <div className="text-lg font-semibold">Semibold Weight (600)</div>
        <div className="text-lg font-bold">Bold Weight (700)</div>
      </div>
    </div>
  </div>
);

// Button showcase component
const ButtonShowcase = () => {
  const [loading, setLoading] = useState(false);
  
  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Button Variants</h3>
      
      {/* Solid Buttons */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Solid Variants</h4>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Primary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="destructive">Error</Button>
          <Button variant="info">Info</Button>
        </div>
      </div>
      
      {/* Outline Buttons */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Outline Variants</h4>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline">Primary</Button>
          <Button variant="outline-success">Success</Button>
          <Button variant="outline-warning">Warning</Button>
          <Button variant="outline-destructive">Error</Button>
          <Button variant="outline-info">Info</Button>
        </div>
      </div>
      
      {/* Ghost Buttons */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Ghost Variants</h4>
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">Primary</Button>
          <Button variant="ghost-success">Success</Button>
          <Button variant="ghost-warning">Warning</Button>
          <Button variant="ghost-destructive">Error</Button>
          <Button variant="ghost-info">Info</Button>
        </div>
      </div>
      
      {/* Button Sizes */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Button Sizes</h4>
        <div className="flex flex-wrap items-end gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium (Default)</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>
      
      {/* Icon Buttons */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Icon Buttons</h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="icon-sm"><CheckIcon /></Button>
          <Button size="icon-md"><CheckIcon /></Button>
          <Button size="icon-lg"><CheckIcon /></Button>
          <Button size="icon-xl"><CheckIcon /></Button>
        </div>
      </div>
      
      {/* Button States */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Button States</h4>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleLoadingDemo}>
            {loading ? 'Processing...' : 'Click for Loading'}
          </Button>
          <Button loading={true} loadingText="Saving...">Save</Button>
        </div>
      </div>
      
      {/* Buttons with Icons */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">Buttons with Icons</h4>
        <div className="flex flex-wrap gap-4">
          <Button><CheckIcon /> Approve Shipment</Button>
          <Button variant="outline"><InfoIcon /> View Details</Button>
          <Button variant="destructive"><XIcon /> Cancel Order</Button>
        </div>
      </div>
    </div>
  );
};

export default function DesignSystemPage() {
  return (
    <div className="container-responsive py-12 space-y-16">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">B2B Shipping Design System</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          A comprehensive design system built for professional shipping and logistics applications.
          This system prioritizes accessibility, mobile-first responsiveness, and B2B user experience patterns.
        </p>
      </div>
      
      {/* Color System */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Color System</h2>
          <p className="text-muted-foreground">
            Professional color palette designed for trust, reliability, and clear communication.
          </p>
        </div>
        
        <ColorPalette 
          title="Primary Colors (Blue Scale)"
          colors={{
            'primary-50': 'oklch(0.975 0.01 264)',
            'primary-100': 'oklch(0.94 0.025 264)',
            'primary-200': 'oklch(0.88 0.04 264)',
            'primary-300': 'oklch(0.77 0.06 264)',
            'primary-400': 'oklch(0.615 0.08 264)',
            'primary-500': 'oklch(0.5 0.1 264)',
            'primary-600': 'oklch(0.4 0.12 264)',
            'primary-700': 'oklch(0.346 0.08 264)',
            'primary-800': 'oklch(0.285 0.06 264)',
            'primary-900': 'oklch(0.22 0.04 264)',
          }}
        />
        
        <ColorPalette 
          title="Semantic Colors"
          colors={{
            'success': 'oklch(0.5 0.13 142)',
            'warning': 'oklch(0.7 0.15 85)',
            'error': 'oklch(0.55 0.2 25)',
            'info': 'oklch(0.55 0.15 230)',
          }}
        />
        
        <ColorPalette 
          title="Neutral Grays"
          colors={{
            'gray-50': 'oklch(0.985 0 0)',
            'gray-100': 'oklch(0.97 0 0)',
            'gray-200': 'oklch(0.922 0 0)',
            'gray-300': 'oklch(0.86 0 0)',
            'gray-400': 'oklch(0.708 0 0)',
            'gray-500': 'oklch(0.556 0 0)',
            'gray-600': 'oklch(0.45 0 0)',
            'gray-700': 'oklch(0.35 0 0)',
            'gray-800': 'oklch(0.269 0 0)',
            'gray-900': 'oklch(0.205 0 0)',
          }}
        />
      </section>
      
      {/* Typography */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Typography</h2>
          <p className="text-muted-foreground">
            System fonts optimized for performance with professional hierarchy and readability.
          </p>
        </div>
        
        <Card className="p-8">
          <TypographyShowcase />
        </Card>
      </section>
      
      {/* Button System */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Button System</h2>
          <p className="text-muted-foreground">
            Comprehensive button variants with touch-friendly sizing and semantic color support.
          </p>
        </div>
        
        <Card className="p-8">
          <ButtonShowcase />
        </Card>
      </section>
      
      {/* Feedback Components */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Feedback Components</h2>
          <p className="text-muted-foreground">
            Components for communicating status, progress, and system feedback to users.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Alerts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alerts</h3>
            <div className="space-y-4">
              <Alert>
                <InfoIcon />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Your shipment has been scheduled for pickup on July 22, 2025.
                </AlertDescription>
              </Alert>
              
              <Alert className="border-success/20 bg-success/10 text-success-foreground [&>svg]:text-success">
                <CheckIcon />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Shipment SHP-2025-123456 has been successfully created and confirmed.
                </AlertDescription>
              </Alert>
              
              <Alert className="border-warning/20 bg-warning/10 text-warning-foreground [&>svg]:text-warning">
                <AlertTriangleIcon />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Pickup location requires special access instructions. Please provide gate code.
                </AlertDescription>
              </Alert>
              
              <Alert className="border-error/20 bg-error/10 text-error-foreground [&>svg]:text-error">
                <XIcon />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Unable to process shipment. Destination address is not in our service area.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Confirmed</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Failed</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
          
          {/* Progress Bars */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Progress Indicators</h3>
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Shipment Processing</span>
                  <span>75%</span>
                </div>
                <Progress value={75} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="[&>div]:bg-warning" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>100%</span>
                </div>
                <Progress value={100} className="[&>div]:bg-success" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Spacing & Layout */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Spacing & Layout</h2>
          <p className="text-muted-foreground">
            Consistent 4px-based spacing system with responsive containers and touch-friendly sizing.
          </p>
        </div>
        
        <Card className="p-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Container Examples</h3>
            
            <div className="space-y-4">
              <div className="container-narrow bg-primary-50 p-4 rounded-lg">
                <code className="text-sm">container-narrow</code> - Max width 768px
              </div>
              
              <div className="container-responsive bg-primary-100 p-4 rounded-lg">
                <code className="text-sm">container-responsive</code> - Max width 1280px (default)
              </div>
              
              <div className="container-wide bg-primary-200 p-4 rounded-lg">
                <code className="text-sm">container-wide</code> - Max width 1536px
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-base font-medium">Touch Target Demonstration</h4>
              <p className="text-sm text-muted-foreground">
                All interactive elements meet WCAG 2.1 AA minimum touch target size of 44px × 44px.
              </p>
              <div className="flex gap-2">
                <Button size="md">44px Touch Target</Button>
                <Button size="icon-md"><CheckIcon /></Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Design Principles */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Design Principles</h2>
          <p className="text-muted-foreground">
            Core principles guiding the B2B shipping design system implementation.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Accessibility First</h3>
            <p className="text-sm text-muted-foreground">
              WCAG 2.1 AA compliance with proper focus management, color contrast, and touch targets.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Mobile Responsive</h3>
            <p className="text-sm text-muted-foreground">
              Mobile-first design with breakpoints at 640px, 768px, 1024px, and beyond.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Professional Trust</h3>
            <p className="text-sm text-muted-foreground">
              Blue-based color palette designed to convey reliability and professionalism.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Performance Optimized</h3>
            <p className="text-sm text-muted-foreground">
              System fonts, optimized animations, and efficient CSS for fast loading.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Consistent Patterns</h3>
            <p className="text-sm text-muted-foreground">
              Standardized component variants and spacing for predictable user experience.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Semantic Clarity</h3>
            <p className="text-sm text-muted-foreground">
              Clear visual hierarchy and semantic color usage for improved comprehension.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
