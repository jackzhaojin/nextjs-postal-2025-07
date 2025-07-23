'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Building, CheckCircle } from 'lucide-react';
import { useBillingInformation } from '@/lib/billing/hooks/useBillingInformation';
import { 
  BillingAddressSection,
  AccountsPayableContactSection,
  CompanyInformationSection,
  InvoicePreferencesSection
} from './components';

interface BillingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function BillingInformationPage() {
  console.log('🏢 [BILLING] Rendering BillingInformationPage');
  
  const router = useRouter();
  const [transaction, setTransaction] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load transaction data from localStorage
  useEffect(() => {
    console.log('🏢 [BILLING] Loading transaction from localStorage');
    
    try {
      const stored = localStorage.getItem('currentShippingTransaction');
      if (stored) {
        const parsedTransaction = JSON.parse(stored);
        setTransaction(parsedTransaction);
        console.log('🏢 [BILLING] Loaded transaction:', parsedTransaction);
      } else {
        console.warn('🏢 [BILLING] No transaction found in localStorage');
        router.push('/shipping');
      }
    } catch (error) {
      console.error('🏢 [BILLING] Failed to load transaction:', error);
      router.push('/shipping');
    }
  }, [router]);

  // Initialize billing hook
  const {
    billingInfo,
    updateBillingInfo,
    validationStatus,
    isLoading,
    isSaving
  } = useBillingInformation(transaction);

  const steps: BillingStep[] = [
    {
      id: 'address',
      title: 'Billing Address',
      description: 'Where invoices should be sent',
      completed: !!billingInfo.billingAddress?.streetAddress && !!billingInfo.billingAddress?.city
    },
    {
      id: 'contact',
      title: 'Accounts Payable Contact',
      description: 'Primary contact for billing questions',
      completed: !!billingInfo.accountsPayableContact?.fullName && !!billingInfo.accountsPayableContact?.email
    },
    {
      id: 'company',
      title: 'Company Information',
      description: 'Business details and classification',
      completed: !!billingInfo.companyInformation?.legalName && !!billingInfo.companyInformation?.businessType
    },
    {
      id: 'preferences',
      title: 'Invoice Preferences',
      description: 'How you want to receive invoices',
      completed: !!billingInfo.invoicePreferences?.deliveryMethod && !!billingInfo.invoicePreferences?.format
    }
  ];

  const handleBillingAddressChange = (address: any) => {
    console.log('🏢 [BILLING] Billing address changed:', address);
    updateBillingInfo({
      ...billingInfo,
      billingAddress: address
    });
  };

  const handleSameAsOriginChange = (same: boolean) => {
    console.log('🏢 [BILLING] Same as origin changed:', same);
    updateBillingInfo({
      ...billingInfo,
      sameAsOriginAddress: same
    });
  };

  const handleContactChange = (contact: any) => {
    console.log('🏢 [BILLING] Contact changed:', contact);
    updateBillingInfo({
      ...billingInfo,
      accountsPayableContact: contact
    });
  };

  const handleCompanyInfoChange = (companyInfo: any) => {
    console.log('🏢 [BILLING] Company info changed:', companyInfo);
    updateBillingInfo({
      ...billingInfo,
      companyInformation: companyInfo
    });
  };

  const handlePreferencesChange = (preferences: any) => {
    console.log('🏢 [BILLING] Preferences changed:', preferences);
    updateBillingInfo({
      ...billingInfo,
      invoicePreferences: preferences
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleContinue();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/shipping/payment');
    }
  };

  const handleContinue = async () => {
    const allStepsCompleted = steps.every(step => step.completed);
    if (!allStepsCompleted) {
      console.warn('🏢 [BILLING] Cannot continue - not all steps completed');
      return;
    }

    setIsSubmitting(true);
    console.log('🏢 [BILLING] Continuing to next step with billing info:', billingInfo);

    try {
      // Update transaction with billing information
      if (transaction) {
        const updatedTransaction = {
          ...transaction,
          paymentInfo: {
            ...transaction.paymentInfo,
            billingInformation: billingInfo
          },
          status: 'billing-complete'
        };

        localStorage.setItem('currentShippingTransaction', JSON.stringify(updatedTransaction));
        console.log('🏢 [BILLING] Updated transaction saved to localStorage');
        
        // Navigate to pickup scheduling
        router.push('/shipping/pickup');
      }
    } catch (error) {
      console.error('🏢 [BILLING] Error saving billing information:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = validationStatus?.completionPercentage || 0;
  const currentStepData = steps[currentStep];
  
  // Convert validation errors array to object format expected by components
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (validationStatus?.validationErrors) {
      validationStatus.validationErrors.forEach(error => {
        errors[error.field] = error.message;
      });
    }
    return errors;
  }, [validationStatus?.validationErrors]);

  if (!transaction || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8" data-testid="billing-information-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing Information</h1>
            <p className="text-gray-600">Set up your billing details and invoice preferences</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Billing Setup Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 min-w-[200px] p-3 rounded-lg border text-left transition-all ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50'
                  : step.completed
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              data-testid={`billing-step-${step.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{step.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mb-8">
        {currentStep === 0 && (
          <BillingAddressSection
            billingAddress={billingInfo.billingAddress}
            sameAsOriginAddress={billingInfo.sameAsOriginAddress}
            originAddress={transaction.origin}
            onBillingAddressChange={handleBillingAddressChange}
            onSameAsOriginChange={handleSameAsOriginChange}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting || isSaving}
          />
        )}

        {currentStep === 1 && (
          <AccountsPayableContactSection
            contact={billingInfo.accountsPayableContact}
            onContactChange={handleContactChange}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting || isSaving}
          />
        )}

        {currentStep === 2 && (
          <CompanyInformationSection
            companyInfo={billingInfo.companyInformation}
            onCompanyInfoChange={handleCompanyInfoChange}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting || isSaving}
          />
        )}

        {currentStep === 3 && (
          <InvoicePreferencesSection
            preferences={billingInfo.invoicePreferences}
            onPreferencesChange={handlePreferencesChange}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting || isSaving}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isSubmitting || isSaving}
          className="flex items-center gap-2"
          data-testid="billing-previous-button"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Back to Payment' : 'Previous'}
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting || isSaving || !steps[currentStep].completed}
              className="flex items-center gap-2"
              data-testid="billing-next-button"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleContinue}
              disabled={isSubmitting || isSaving || !steps.every(step => step.completed)}
              className="flex items-center gap-2"
              data-testid="billing-continue-button"
            >
              {isSubmitting || isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Pickup
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div><strong>Progress:</strong> {Math.round(progress)}%</div>
              <div><strong>All Steps Completed:</strong> {steps.every(step => step.completed) ? 'Yes' : 'No'}</div>
              <div><strong>Current Step:</strong> {currentStepData.title}</div>
              <div><strong>Validation Errors:</strong> {Object.keys(validationErrors).length}</div>
              {Object.keys(validationErrors).length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View Errors</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(validationErrors, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
