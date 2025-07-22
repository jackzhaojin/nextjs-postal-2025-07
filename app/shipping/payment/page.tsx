'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShipping } from '@/components/providers/ShippingProvider';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { Button } from '@/components/ui/button';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { PurchaseOrderForm } from './components/payment-methods/PurchaseOrderForm';
import { BillOfLadingForm } from './components/payment-methods/BillOfLadingForm';
import { ThirdPartyBillingForm } from './components/payment-methods/ThirdPartyBillingForm';
import { NetTermsForm } from './components/payment-methods/NetTermsForm';
import { CorporateAccountForm } from './components/payment-methods/CorporateAccountForm';
import { PaymentMethodType, PaymentInfo } from '@/lib/payment/types';
import { ShippingTransaction } from '@/lib/types';
import { validatePaymentInfo } from '@/lib/payment/validation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function PaymentPage() {
  const { transaction, updateTransaction, saveProgress, isLoading } = useShipping();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(
    transaction?.paymentInfo?.method
  );
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(
    transaction?.paymentInfo || { method: 'po', validationStatus: 'incomplete', lastUpdated: new Date().toISOString(), paymentDetails: {} }
  );
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction?.paymentInfo) {
      setSelectedMethod(transaction.paymentInfo.method);
      setPaymentInfo(transaction.paymentInfo);
    }
  }, [transaction]);

  useEffect(() => {
    if (selectedMethod) {
      const newPaymentInfo: PaymentInfo = {
        ...paymentInfo,
        method: selectedMethod,
        lastUpdated: new Date().toISOString(),
      };
      setPaymentInfo(newPaymentInfo);
      // Validate and update transaction immediately on method change
      handlePaymentInfoChange(newPaymentInfo);
    }
  }, [selectedMethod]);

  const handlePaymentInfoChange = (updatedInfo: PaymentInfo) => {
    setPaymentInfo(updatedInfo);
    const validationResult = validatePaymentInfo(updatedInfo);
    setErrors(validationResult.errors);

    const newValidationStatus: 'incomplete' | 'complete' = Object.keys(validationResult.errors).length === 0 ? 'complete' : 'incomplete';
    const updatedTransaction = {
      ...transaction,
      paymentInfo: {
        ...updatedInfo,
        validationStatus: newValidationStatus,
      },
      status: 'payment' as 'payment',
    };
    updateTransaction(updatedTransaction as Partial<ShippingTransaction>);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    const validationResult = validatePaymentInfo(paymentInfo);
    setErrors(validationResult.errors);

    if (Object.keys(validationResult.errors).length > 0) {
      toast.error('Please correct the errors in the payment information.');
      setIsSubmitting(false);
      return;
    }

    const updatedTransaction = {
      ...transaction,
      paymentInfo: {
        ...paymentInfo,
        validationStatus: 'complete',
      },
      status: 'pickup' as 'pickup', // Move to next step
    };

    await updateTransaction(updatedTransaction as Partial<ShippingTransaction>);
    setIsSubmitting(false);
    router.push('/shipping/payment/billing');
  };

  const handleBack = () => {
    router.push('/shipping/pricing');
  };

  const progress = selectedMethod ? 33 : 0; // Example progress

  return (
    <div className="container mx-auto p-4">
      <StepIndicator currentStep={3} steps={[]} />
      <h1 className="text-3xl font-bold mb-6 text-center">Payment Information</h1>
      <Progress value={progress} className="w-full mb-6" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
        </CardContent>
      </Card>

      {selectedMethod && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedMethod.replace(/([A-Z])/g, ' $1').trim()} Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMethod === 'po' && (
              <PurchaseOrderForm
                paymentInfo={paymentInfo}
                onPaymentInfoChange={handlePaymentInfoChange}
                validationErrors={errors}
                isSubmitting={isSubmitting}
              />
            )}
            {selectedMethod === 'bol' && (
              <BillOfLadingForm
                paymentInfo={paymentInfo}
                onPaymentInfoChange={handlePaymentInfoChange}
                validationErrors={errors}
                isSubmitting={isSubmitting}
              />
            )}
            {selectedMethod === 'thirdparty' && (
              <ThirdPartyBillingForm
                paymentInfo={paymentInfo}
                onPaymentInfoChange={handlePaymentInfoChange}
                validationErrors={errors}
                isSubmitting={isSubmitting}
              />
            )}
            {selectedMethod === 'net' && (
              <NetTermsForm
                paymentInfo={paymentInfo}
                onPaymentInfoChange={handlePaymentInfoChange}
                validationErrors={errors}
                isSubmitting={isSubmitting}
              />
            )}
            {selectedMethod === 'corporate' && (
              <CorporateAccountForm
                paymentInfo={paymentInfo}
                onPaymentInfoChange={handlePaymentInfoChange}
                validationErrors={errors}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack}>
          Back to Pricing
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting || !selectedMethod || Object.keys(errors).length > 0}>
          {isSubmitting ? 'Saving...' : 'Continue to Pickup'}
        </Button>
      </div>
    </div>
  );
}