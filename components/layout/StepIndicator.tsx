'use client';

import React from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  title: string;
  description: string;
  path: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'error';
  completed: boolean;
  disabled?: boolean;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
  allowNavigation?: boolean;
  compact?: boolean;
  className?: string;
  onStepClick?: (step: Step) => void;
}

export function StepIndicator({
  currentStep,
  steps,
  allowNavigation = false,
  compact = false,
  className,
  onStepClick
}: StepIndicatorProps) {
  const handleStepClick = (step: Step) => {
    if (allowNavigation && !step.disabled && onStepClick) {
      onStepClick(step);
    }
  };

  const getStepIcon = (step: Step) => {
    if (step.status === 'completed') {
      return <Check className="h-4 w-4" />;
    }
    if (step.status === 'error') {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (step.status === 'in-progress') {
      return <Circle className="h-4 w-4 fill-current" />;
    }
    return <Circle className="h-4 w-4" />;
  };

  const getStepColor = (step: Step) => {
    if (step.status === 'completed') {
      return 'text-green-600 bg-green-100 border-green-200';
    }
    if (step.status === 'error') {
      return 'text-red-600 bg-red-100 border-red-200';
    }
    if (step.status === 'in-progress') {
      return 'text-blue-600 bg-blue-100 border-blue-200';
    }
    return 'text-gray-400 bg-gray-50 border-gray-200';
  };

  const getConnectorColor = (index: number) => {
    const currentStepItem = steps[index];
    const nextStepItem = steps[index + 1];
    
    if (currentStepItem.status === 'completed') {
      return 'bg-green-200';
    }
    if (currentStepItem.status === 'in-progress' && nextStepItem) {
      return 'bg-gradient-to-r from-blue-200 to-gray-200';
    }
    return 'bg-gray-200';
  };

  if (compact) {
    // Mobile/compact version - horizontal progress bar
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    return (
      <div className={cn('w-full px-4 py-3 bg-background border-b', className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-foreground font-medium">
            {steps.find(step => step.id === currentStep)?.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {steps.find(step => step.id === currentStep)?.description}
          </p>
        </div>
      </div>
    );
  }

  // Desktop version - full step display
  return (
    <nav 
      className={cn('p-6 bg-background border-b', className)}
      aria-label="Progress"
    >
      <ol className="flex items-center justify-between space-x-2 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            {/* Step circle */}
            <button
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200',
                getStepColor(step),
                allowNavigation && !step.disabled && 'hover:scale-105 cursor-pointer',
                step.disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => handleStepClick(step)}
              disabled={step.disabled || !allowNavigation}
              aria-label={`${step.title} - ${step.status}`}
              aria-current={step.status === 'in-progress' ? 'step' : undefined}
            >
              {getStepIcon(step)}
            </button>

            {/* Step details */}
            <div className="ml-3 min-w-0 flex-1 hidden md:block">
              <p className={cn(
                'text-sm font-medium',
                step.status === 'completed' ? 'text-green-600' :
                step.status === 'in-progress' ? 'text-blue-600' :
                step.status === 'error' ? 'text-red-600' :
                'text-gray-500'
              )}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 md:mx-4">
                <div className={cn(
                  'h-0.5 w-full transition-all duration-300',
                  getConnectorColor(index)
                )} />
              </div>
            )}
          </li>
        ))}
      </ol>
      
      {/* Mobile step details */}
      <div className="mt-4 md:hidden">
        <p className="text-sm font-medium text-foreground">
          {steps.find(step => step.id === currentStep)?.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {steps.find(step => step.id === currentStep)?.description}
        </p>
      </div>
    </nav>
  );
}
