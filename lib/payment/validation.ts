import { z } from 'zod';
import { 
  PaymentInfo,
  purchaseOrderSchema,
  billOfLadingSchema,
  thirdPartyBillingSchema,
  netTermsSchema,
  corporateAccountSchema,
} from './types';
import { BillingInfo, billingInfoSchema } from './billingTypes';

export const validatePaymentInfo = (paymentInfo: PaymentInfo) => {
  let errors: { [key: string]: string } = {};

  try {
    switch (paymentInfo.method) {
      case 'PurchaseOrder':
        purchaseOrderSchema.parse(paymentInfo.purchaseOrder);
        break;
      case 'BillOfLading':
        billOfLadingSchema.parse(paymentInfo.billOfLading);
        break;
      case 'ThirdPartyBilling':
        thirdPartyBillingSchema.parse(paymentInfo.thirdPartyBilling);
        break;
      case 'NetTerms':
        netTermsSchema.parse(paymentInfo.netTerms);
        break;
      case 'CorporateAccount':
        corporateAccountSchema.parse(paymentInfo.corporateAccount);
        break;
      default:
        errors.method = 'Invalid payment method selected.';
    }
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      e.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
    } else {
      errors.general = e.message;
    }
  }

  return { errors };
};

export const validateBillingInfo = (billingInfo: BillingInfo) => {
  let errors: { [key: string]: string } = {};

  try {
    billingInfoSchema.parse(billingInfo);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      e.errors.forEach((err) => {
        // Construct a path for nested errors
        const path = err.path.join('.');
        errors[path] = err.message;
      });
    } else {
      errors.general = e.message;
    }
  }

  return { errors };
};
