'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isValid?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  previousLabel?: string;
  nextLabel?: string;
  saveLabel?: string;
  className?: string;
}

export function Navigation({
  currentStep,
  totalSteps,
  canGoBack = true,
  canGoNext = true,
  isValid = true,
  isLoading = false,
  isSaving = false,
  onPrevious,
  onNext,
  onSave,
  previousLabel,
  nextLabel,
  saveLabel = 'Save Draft',
  className
}: NavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const getPreviousLabel = () => {
    if (previousLabel) return previousLabel;
    return isFirstStep ? 'Back to Start' : 'Previous';
  };

  const getNextLabel = () => {
    if (nextLabel) return nextLabel;
    if (isLastStep) return 'Submit';
    return 'Continue';
  };

  const handlePrevious = () => {
    if (canGoBack && onPrevious && !isLoading) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (canGoNext && isValid && onNext && !isLoading) {
      onNext();
    }
  };

  const handleSave = () => {
    if (onSave && !isSaving && !isLoading) {
      onSave();
    }
  };

  return (
    <div className={cn(
      'sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4',
      className
    )}>
      <div className="container flex items-center justify-between gap-4">
        {/* Previous button */}
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!canGoBack || isLoading}
              className="min-w-[100px]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {getPreviousLabel()}
            </Button>
          )}
        </div>

        {/* Center section - Auto-save status */}
        <div className="flex items-center gap-4">
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="hidden sm:flex items-center gap-1 text-muted-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  <span className="text-xs">{saveLabel}</span>
                </>
              )}
            </Button>
          )}

          {/* Progress indicator (mobile) */}
          <div className="flex sm:hidden items-center gap-1 text-xs text-muted-foreground">
            <span>{currentStep}</span>
            <span>/</span>
            <span>{totalSteps}</span>
          </div>
        </div>

        {/* Next button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNext}
            disabled={!canGoNext || !isValid || isLoading}
            className={cn(
              'min-w-[100px]',
              isLastStep && 'bg-green-600 hover:bg-green-700'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {isLastStep ? 'Submitting...' : 'Loading...'}
              </>
            ) : (
              <>
                {getNextLabel()}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation message */}
      {!isValid && !isLoading && (
        <div className="container mt-2">
          <p className="text-sm text-red-600 text-center">
            Please complete all required fields before continuing
          </p>
        </div>
      )}
    </div>
  );
}
