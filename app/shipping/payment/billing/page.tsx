'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShippingTransaction } from '@/components/providers/ShippingProvider';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { BillingInfo, BillingValidationStatus } from '@/lib/payment/billingTypes';
import { BillingAddressSection } from './components/BillingAddressSection';
import { AccountsPayableSection } from './components/AccountsPayableSection';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { InvoicePreferencesSection } from './components/InvoicePreferencesSection';
import { validateBillingInfo } from '@/lib/payment/validation'; // Assuming this will be updated to validate BillingInfo

export default function BillingInformationPage() {
  const { transaction, updateTransaction } = useShippingTransaction();
  const router = useRouter();

  const [billingInfo, setBillingInfo] = useState<BillingInfo>(() => {
    // Initialize billingInfo from transaction or with default values
    if (transaction?.paymentInfo?.billingInformation) {
      return transaction.paymentInfo.billingInformation;
    } else {
      // Provide default values for all nested objects
      return {
        billingAddress: {
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          isResidential: false,
          contactInfo: { name: '', phone: '', email: '' },
          locationType: 'commercial',
        },
        sameAsOriginAddress: false,
        accountsPayableContact: { name: '', phone: '', email: '' },
        taxId: { value: '', countryCode: '' },
        companyInformation: {
          legalName: '',
          businessType: 'Other',
          industry: 'Other',
          annualShippingVolume: '< $10K',
        },
        invoicePreferences: {
          deliveryMethod: 'Email',
          format: 'Standard',
          frequency: 'Per shipment',
        },
        validationStatus: 'incomplete',
        lastUpdated: new Date().toISOString(),
      };
    }
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction?.paymentInfo?.billingInformation) {
      setBillingInfo(transaction.paymentInfo.billingInformation);
    }
  }, [transaction]);

  const handleBillingInfoChange = (updatedInfo: BillingInfo) => {
    setBillingInfo(updatedInfo);
    const validationResult = validateBillingInfo(updatedInfo);
    setErrors(validationResult.errors);

    const newValidationStatus: BillingValidationStatus = Object.keys(validationResult.errors).length === 0 ? 'complete' : 'incomplete';
    
    // Update the transaction with the new billing information and its validation status
    const updatedTransaction = {
      ...transaction,
      paymentInfo: {
        ...transaction?.paymentInfo,
        billingInformation: {
          ...updatedInfo,
          validationStatus: newValidationStatus,
        },
      },
      status: 'payment', // Keep status as payment until this step is fully completed
    };
    updateTransaction(updatedTransaction);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    const validationResult = validateBillingInfo(billingInfo);
    setErrors(validationResult.errors);

    if (Object.keys(validationResult.errors).length > 0) {
      toast.error('Please correct the errors in the billing information.');
      setIsSubmitting(false);
      return;
    }

    const updatedTransaction = {
      ...transaction,
      paymentInfo: {
        ...transaction?.paymentInfo,
        billingInformation: {
          ...billingInfo,
          validationStatus: 'complete',
        },
      },
      status: 'review', // Move to next step (Review)
    };

    await updateTransaction(updatedTransaction);
    setIsSubmitting(false);
    router.push('/shipping/review');
  };

  const handleBack = () => {
    router.push('/shipping/payment'); // Go back to payment method selection
  };

  const progress = Object.keys(errors).length === 0 && billingInfo.validationStatus === 'complete' ? 100 : 50; // Example progress

  return (
    <div className="container mx-auto p-4">
      <StepIndicator currentStep={3} /> {/* Still step 3, but a sub-step */}
      <h1 className="text-3xl font-bold mb-6 text-center">Billing Information</h1>
      <Progress value={progress} className="w-full mb-6" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingAddressSection
            billingInfo={billingInfo}
            onBillingInfoChange={handleBillingInfoChange}
            validationErrors={errors}
            isSubmitting={isSubmitting}
            originAddress={transaction?.shipmentDetails?.origin} // Pass origin address for smart defaults
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Accounts Payable Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountsPayableSection
            billingInfo={billingInfo}
            onBillingInfoChange={handleBillingInfoChange}
            validationErrors={errors}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyInfoSection
            billingInfo={billingInfo}
            onBillingInfoChange={handleBillingInfoChange}
            validationErrors={errors}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invoice Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicePreferencesSection
            billingInfo={billingInfo}
            onBillingInfoChange={handleBillingInfoChange}
            validationErrors={errors}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack}>
          Back to Payment Method
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting || Object.keys(errors).length > 0 || billingInfo.validationStatus !== 'complete'}>
          {isSubmitting ? 'Saving...' : 'Continue to Review'}
        </Button>
      </div>
    </div>
  );
}
