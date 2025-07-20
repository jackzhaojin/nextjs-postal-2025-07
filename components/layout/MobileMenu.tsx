'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Package, CreditCard, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { Step } from './StepIndicator';

interface MobileMenuProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: Step) => void;
  allowNavigation?: boolean;
  className?: string;
}

const stepIcons = {
  1: Package,
  2: CreditCard,
  3: CreditCard,
  4: Calendar,
  5: FileText,
  6: CheckCircle
};

export function MobileMenu({
  currentStep,
  steps,
  onStepClick,
  allowNavigation = false,
  className
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStepClick = (step: Step) => {
    if (allowNavigation && !step.disabled && onStepClick) {
      onStepClick(step);
      setIsOpen(false);
    }
  };

  const getStepIcon = (stepId: number) => {
    const IconComponent = stepIcons[stepId as keyof typeof stepIcons] || Package;
    return IconComponent;
  };

  const getStepStatusColor = (step: Step) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={cn('md:hidden', className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Shipping Steps
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-1">
            {/* Home link */}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            
            {/* Step navigation */}
            <div className="border-t pt-4 mt-4">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Shipping Process
              </h3>
              
              {steps.map((step) => {
                const IconComponent = getStepIcon(step.id);
                const isClickable = allowNavigation && !step.disabled;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step)}
                    disabled={!isClickable}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors',
                      step.id === currentStep
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      !isClickable && 'opacity-50 cursor-not-allowed',
                      isClickable && 'cursor-pointer'
                    )}
                  >
                    <IconComponent className={cn('h-4 w-4', getStepStatusColor(step))} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{step.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      step.status === 'completed' ? 'bg-green-600' :
                      step.status === 'in-progress' ? 'bg-blue-600' :
                      step.status === 'error' ? 'bg-red-600' :
                      'bg-gray-300'
                    )} />
                  </button>
                );
              })}
            </div>
            
            {/* Quick actions */}
            <div className="border-t pt-4 mt-6">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Actions
              </h3>
              
              <button
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="h-4 w-4" />
                Save Draft
              </button>
              
              <button
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
                Reset Form
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
