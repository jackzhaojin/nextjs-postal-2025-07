'use client';

import React from 'react';
import { Header } from './Header';
import { StepIndicator, type Step } from './StepIndicator';
import { Navigation } from './Navigation';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';

interface ShippingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  steps: Step[];
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  showStepIndicator?: boolean;
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
  allowStepNavigation?: boolean;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isValid?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onStepClick?: (step: Step) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  className?: string;
}

export function ShippingLayout({
  children,
  currentStep,
  steps,
  breadcrumbs,
  title,
  showStepIndicator = true,
  showNavigation = true,
  showBreadcrumbs = false,
  allowStepNavigation = false,
  canGoBack = true,
  canGoNext = true,
  isValid = true,
  isLoading = false,
  isSaving = false,
  onStepClick,
  onPrevious,
  onNext,
  onSave,
  onReset,
  className
}: ShippingLayoutProps) {
  const currentStepData = steps.find(step => step.id === currentStep);
  const pageTitle = title || currentStepData?.title || 'Shipping Process';

  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      {/* Header */}
      <Header
        title={pageTitle}
        showBackButton={currentStep > 1}
        onBackClick={onPrevious}
        onResetClick={onReset}
      />

      {/* Breadcrumbs (desktop only) */}
      {showBreadcrumbs && breadcrumbs && (
        <div className="hidden md:block border-b bg-muted/50">
          <div className="container py-2 px-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      )}

      {/* Step Indicator */}
      {showStepIndicator && (
        <>
          {/* Desktop version */}
          <div className="hidden md:block">
            <StepIndicator
              currentStep={currentStep}
              steps={steps}
              allowNavigation={allowStepNavigation}
              onStepClick={onStepClick}
            />
          </div>
          
          {/* Mobile version */}
          <div className="md:hidden">
            <StepIndicator
              currentStep={currentStep}
              steps={steps}
              allowNavigation={allowStepNavigation}
              compact={true}
              onStepClick={onStepClick}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 container px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Page header with mobile menu */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h1 className="text-xl font-semibold text-foreground">
              {pageTitle}
            </h1>
            <MobileMenu
              currentStep={currentStep}
              steps={steps}
              onStepClick={onStepClick}
              allowNavigation={allowStepNavigation}
            />
          </div>

          {/* Auto-save status (mobile) */}
          {isSaving && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md md:hidden">
              <p className="text-sm text-blue-600">Saving changes...</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>

      {/* Navigation Controls */}
      {showNavigation && (
        <Navigation
          currentStep={currentStep}
          totalSteps={steps.length}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          isValid={isValid}
          isLoading={isLoading}
          isSaving={isSaving}
          onPrevious={onPrevious}
          onNext={onNext}
          onSave={onSave}
        />
      )}
    </div>
  );
}
