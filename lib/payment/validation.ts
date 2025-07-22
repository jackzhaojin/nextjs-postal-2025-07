import { z } from "zod";
import { MonetaryAmountSchema } from "@/lib/types"; // Assuming MonetaryAmountSchema is defined here

// Helper for email and phone validation
const contactInfoSchema = z.string().refine(
  (val) => {
    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return emailRegex.test(val) || phoneRegex.test(val);
  },
  { message: "Must be a valid business email or phone number" }
);

export const PurchaseOrderInfoSchema = z.object({
  poNumber: z.string().min(4).max(50, "PO Number must be between 4 and 50 characters"),
  poAmount: MonetaryAmountSchema.refine((val) => val.amount >= 0, { // Placeholder for actual shipping total comparison
    message: "PO Amount must be greater than or equal to the calculated shipping total",
  }),
  poExpiration: z.string().refine((val) => new Date(val) > new Date(), {
    message: "PO Expiration must be a future date",
  }),
  approvalContact: contactInfoSchema,
  departmentCostCenter: z.string().max(50).optional(),
});

export const BillOfLadingInfoSchema = z.object({
  bolNumber: z.string().regex(/^BOL-\d{4}-\d{6}$/, "BOL Number must follow BOL-YYYY-XXXXXX format"),
  bolDate: z.string().refine((val) => new Date(val) <= new Date(), {
    message: "BOL Date cannot be a future date",
  }),
  shipperReference: z.string().max(20).optional(),
  freightTerms: z.string().min(1, "Freight Terms are required"), // Assuming this will be a dropdown selection
});

export const ThirdPartyBillingInfoSchema = z.object({
  accountNumber: z.string().regex(/^\d{8,15}$/, "Account Number must be 8-15 digits"), // Luhn algorithm check simulation would be here
  companyName: z.string().min(1).max(100, "Company Name is required and max 100 characters"),
  contactInfo: contactInfoSchema,
  authorizationCode: z.string().max(10).optional(),
});

export const NetTermsInfoSchema = z.object({
  netTermsPeriod: z.string().min(1, "Net Terms Period is required"), // Assuming dropdown
  creditApplication: z.string().refine((val) => /\.(pdf|doc|docx)$/i.test(val) && /* file size check */ true, {
    message: "Credit Application must be a PDF or DOC file and max 5MB",
  }),
  tradeReferences: z.array(z.object({
    name: z.string().min(1, "Reference Name is required"),
    contact: contactInfoSchema,
  })).min(3, "At least 3 trade references are required"),
  annualRevenue: z.string().min(1, "Annual Revenue is required"), // Assuming range selection
});

export const CorporateAccountInfoSchema = z.object({
  accountNumber: z.string().min(1, "Account Number is required"), // Existing account lookup simulation
  accountPin: z.string().regex(/^\d{4,6}$/, "Account PIN must be 4-6 digits"),
  billingContact: contactInfoSchema,
});

export const PaymentInfoSchema = z.object({
  method: z.enum([
    "purchaseOrder",
    "billOfLading",
    "thirdPartyBilling",
    "netTerms",
    "corporateAccount",
  ]),
  purchaseOrder: PurchaseOrderInfoSchema.optional(),
  billOfLading: BillOfLadingInfoSchema.optional(),
  thirdPartyBilling: ThirdPartyBillingInfoSchema.optional(),
  netTerms: NetTermsInfoSchema.optional(),
  corporateAccount: CorporateAccountInfoSchema.optional(),
  totalWithPaymentFees: MonetaryAmountSchema.optional(),
  validationStatus: z.enum([
    "notStarted",
    "inProgress",
    "completed",
    "failed",
  ]),
  lastUpdated: z.string().datetime(),
}).superRefine((data, ctx) => {
  if (data.method === "purchaseOrder" && !data.purchaseOrder) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Purchase Order details are required",
      path: ["purchaseOrder"],
    });
  }
  if (data.method === "billOfLading" && !data.billOfLading) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bill of Lading details are required",
      path: ["billOfLading"],
    });
  }
  if (data.method === "thirdPartyBilling" && !data.thirdPartyBilling) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Third-Party Billing details are required",
      path: ["thirdPartyBilling"],
    });
  }
  if (data.method === "netTerms" && !data.netTerms) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Net Terms details are required",
      path: ["netTerms"],
    });
  }
  if (data.method === "corporateAccount" && !data.corporateAccount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Corporate Account details are required",
      path: ["corporateAccount"],
    });
  }
});
