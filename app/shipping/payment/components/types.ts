import { PaymentInfo, ValidationResult } from "@/lib/payment/types";

export interface PaymentMethodFormProps {
  paymentInfo?: PaymentInfo;
  onPaymentInfoChange: (info: Partial<PaymentInfo>) => void;
  validationErrors: ValidationResult["errors"];
  isSubmitting: boolean;
}
