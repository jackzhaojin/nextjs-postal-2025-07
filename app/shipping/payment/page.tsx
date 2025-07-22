import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentTransaction } from '@/lib/payment/hooks/usePaymentTransaction';
import { PaymentMethodType } from '@/lib/payment/types';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { PurchaseOrderForm } from './components/payment-methods/PurchaseOrderForm';
import { BillOfLadingForm } from './components/payment-methods/BillOfLadingForm';
import { ThirdPartyBillingForm } from './components/payment-methods/ThirdPartyBillingForm';
import { NetTermsForm } from './components/payment-methods/NetTermsForm';
import { CorporateAccountForm } from './components/payment-methods/CorporateAccountForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const PaymentMethodPage: React.FC = () => {
  const router = useRouter();
  const { paymentInfo, updatePaymentInfo, validatePaymentMethod, isPaymentMethodComplete } = usePaymentTransaction();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    paymentInfo?.method || 'purchaseOrder'
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paymentInfo?.method) {
      setSelectedMethod(paymentInfo.method);
    }
  }, [paymentInfo?.method]);

  const handleMethodChange = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    updatePaymentInfo({ method });
    setValidationErrors({}); // Clear errors when method changes
  };

  const handlePaymentInfoChange = (info: Partial<PaymentInfo>) => {
    updatePaymentInfo({
      ...paymentInfo,
      ...info,
      method: selectedMethod, // Ensure the method is always set
    });
  };

  const renderPaymentForm = () => {
    const commonProps = {
      paymentInfo: paymentInfo || undefined,
      onPaymentInfoChange: handlePaymentInfoChange,
      validationErrors,
      isSubmitting,
    };

    switch (selectedMethod) {
      case 'purchaseOrder':
        return <PurchaseOrderForm {...commonProps} />;
      case 'billOfLading':
        return <BillOfLadingForm {...commonProps} />;
      case 'thirdPartyBilling':
        return <ThirdPartyBillingForm {...commonProps} />;
      case 'netTerms':
        return <NetTermsForm {...commonProps} />;
      case 'corporateAccount':
        return <CorporateAccountForm {...commonProps} />;
      default:
        return <p>Select a payment method to continue.</p>;
    }
  };

  const handleNext = () => {
    setIsSubmitting(true);
    const result = validatePaymentMethod(selectedMethod);
    if (result.isValid) {
      updatePaymentInfo({ validationStatus: 'completed' });
      router.push('/shipping/pickup'); // Navigate to the next step
    } else {
      setValidationErrors(result.errors);
      updatePaymentInfo({ validationStatus: 'failed' });
      console.error('Validation failed:', result.errors);
    }
    setIsSubmitting(false);
  };

  const handleBack = () => {
    router.push('/shipping/pricing'); // Navigate to the previous step
  };

  const isFormValid = isPaymentMethodComplete(selectedMethod);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Select your preferred B2B payment method.</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={handleMethodChange}
          />
        </CardContent>
      </Card>

      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            Please correct the following issues:
            <ul className="list-disc pl-5 mt-2">
              {Object.entries(validationErrors).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enter Payment Details</CardTitle>
          <CardDescription>Provide the necessary information for your selected payment method.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderPaymentForm()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Continue to Pickup'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodPage;