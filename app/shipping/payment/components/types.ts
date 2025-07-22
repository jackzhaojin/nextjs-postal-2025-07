import { PaymentInfo } from "@/lib/payment/types";
import { ValidationResult } from "@/lib/types";

export interface PaymentMethodFormProps {
  paymentInfo?: PaymentInfo;
  onPaymentInfoChange: (info: Partial<PaymentInfo>) => void;
  validationErrors: ValidationResult["errors"];
  isSubmitting: boolean;
}
