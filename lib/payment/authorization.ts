import type { PaymentInfo } from '@/lib/types';

export interface PaymentAuthorizationResult {
  authorized: boolean;
  authorizationCode?: string;
  transactionId?: string;
  reason?: string;
  processingTime: number;
  method: string;
}

/**
 * Simulate payment authorization for various B2B payment methods
 */
export async function authorizePayment(paymentInfo: PaymentInfo): Promise<PaymentAuthorizationResult> {
  console.log('💳 [PAYMENT-AUTH] Starting payment authorization for method:', paymentInfo.method);
  const startTime = Date.now();
  
  try {
    // Simulate processing delay based on payment method
    const processingDelay = getProcessingDelay(paymentInfo.method);
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    // Simulate authorization based on payment method
    const authResult = await processPaymentMethod(paymentInfo);
    
    const processingTime = Date.now() - startTime;
    console.log('✅ [PAYMENT-AUTH] Authorization completed:', {
      method: paymentInfo.method,
      authorized: authResult.authorized,
      processingTime: `${processingTime}ms`,
      authCode: authResult.authorizationCode
    });
    
    return {
      ...authResult,
      processingTime,
      method: paymentInfo.method
    };
    
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('💥 [PAYMENT-AUTH] Authorization failed:', {
      method: paymentInfo.method,
      error: error.message,
      processingTime: `${processingTime}ms`
    });
    
    return {
      authorized: false,
      reason: error.message || 'Payment authorization failed',
      processingTime,
      method: paymentInfo.method
    };
  }
}

/**
 * Process authorization for specific payment method
 */
async function processPaymentMethod(paymentInfo: PaymentInfo): Promise<Omit<PaymentAuthorizationResult, 'processingTime' | 'method'>> {
  console.log(`🔄 [PAYMENT-AUTH] Processing ${paymentInfo.method} authorization...`);
  
  switch (paymentInfo.method) {
    case 'po':
      return await authorizePurchaseOrder(paymentInfo);
    case 'bol':
      return await authorizeBillOfLading(paymentInfo);
    case 'thirdparty':
      return await authorizeThirdParty(paymentInfo);
    case 'net':
      return await authorizeNetTerms(paymentInfo);
    case 'corporate':
      return await authorizeCorporateAccount(paymentInfo);
    default:
      throw new Error(`Unsupported payment method: ${paymentInfo.method}`);
  }
}

/**
 * Authorize Purchase Order payment
 */
async function authorizePurchaseOrder(paymentInfo: PaymentInfo): Promise<Omit<PaymentAuthorizationResult, 'processingTime' | 'method'>> {
  console.log('📋 [PAYMENT-AUTH] Authorizing Purchase Order...');
  
  if (!paymentInfo.paymentDetails) {
    throw new Error('Payment details are required');
  }
  
  const poDetails = paymentInfo.paymentDetails.purchaseOrder;
  if (!poDetails) {
    throw new Error('Purchase Order details are required');
  }
  
  // Simulate PO validation
  const validationChecks = [
    { check: 'PO Number Format', pass: validatePONumber(poDetails.poNumber) },
    { check: 'PO Amount Validity', pass: poDetails.poAmount > 0 },
    { check: 'PO Expiration', pass: new Date(poDetails.expirationDate) > new Date() },
    { check: 'Approval Contact', pass: poDetails.approvalContact.length > 0 },
    { check: 'Department Code', pass: poDetails.department.length > 0 }
  ];
  
  console.log('🔍 [PAYMENT-AUTH] PO validation checks:', validationChecks);
  
  const allChecksPassed = validationChecks.every(check => check.pass);
  
  // Simulate 95% success rate for valid POs
  const authSuccess = allChecksPassed && Math.random() > 0.05;
  
  if (authSuccess) {
    const authCode = generateAuthorizationCode('PO');
    console.log('✅ [PAYMENT-AUTH] PO authorized:', { 
      poNumber: poDetails.poNumber, 
      authCode,
      amount: poDetails.poAmount 
    });
    
    return {
      authorized: true,
      authorizationCode: authCode,
      transactionId: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
  } else {
    const failedChecks = validationChecks.filter(check => !check.pass);
    const reason = failedChecks.length > 0 
      ? `PO validation failed: ${failedChecks.map(c => c.check).join(', ')}`
      : 'PO authorization declined';
    
    console.log('❌ [PAYMENT-AUTH] PO authorization failed:', { reason, failedChecks });
    
    return {
      authorized: false,
      reason
    };
  }
}

/**
 * Authorize Bill of Lading payment
 */
async function authorizeBillOfLading(paymentInfo: PaymentInfo): Promise<Omit<PaymentAuthorizationResult, 'processingTime' | 'method'>> {
  console.log('📄 [PAYMENT-AUTH] Authorizing Bill of Lading...');
  
  if (!paymentInfo.paymentDetails) {
    throw new Error('Payment details are required');
  }
  
  const bolDetails = paymentInfo.paymentDetails.billOfLading;
  if (!bolDetails) {
    throw new Error('Bill of Lading details are required');
  }
  
  // Simulate BOL validation
  const validationChecks = [
    { check: 'BOL Number Format', pass: validateBOLNumber(bolDetails.bolNumber) },
    { check: 'BOL Date Validity', pass: new Date(bolDetails.bolDate) <= new Date() },
    { check: 'Shipper Reference', pass: bolDetails.shipperReference.length > 0 },
    { check: 'Freight Terms', pass: ['prepaid', 'collect', 'prepaid-add'].includes(bolDetails.freightTerms) }
  ];
  
  console.log('🔍 [PAYMENT-AUTH] BOL validation checks:', validationChecks);
  
  const allChecksPassed = validationChecks.every(check => check.pass);
  
  // Simulate 97% success rate for valid BOLs
  const authSuccess = allChecksPassed && Math.random() > 0.03;
  
  if (authSuccess) {
    const authCode = generateAuthorizationCode('BOL');
    console.log('✅ [PAYMENT-AUTH] BOL authorized:', { 
      bolNumber: bolDetails.bolNumber, 
      authCode,
      freightTerms: bolDetails.freightTerms
    });
    
    return {
      authorized: true,
      authorizationCode: authCode,
      transactionId: `BOL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
  } else {
    const failedChecks = validationChecks.filter(check => !check.pass);
    const reason = failedChecks.length > 0 
      ? `BOL validation failed: ${failedChecks.map(c => c.check).join(', ')}`
      : 'BOL authorization declined';
    
    console.log('❌ [PAYMENT-AUTH] BOL authorization failed:', { reason });
    
    return {
      authorized: false,
      reason
    };
  }
}

/**
 * Authorize Third Party billing
 */
async function authorizeThirdParty(paymentInfo: PaymentInfo): Promise<Omit<PaymentAuthorizationResult, 'processingTime' | 'method'>> {
  console.log('🏢 [PAYMENT-AUTH] Authorizing Third Party billing...');
  
  if (!paymentInfo.paymentDetails) {
    throw new Error('Payment details are required');
  }
  
  const thirdPartyDetails = paymentInfo.paymentDetails.thirdParty;
  if (!thirdPartyDetails) {
    throw new Error('Third Party billing details are required');
  }
  
  // Simulate third party account validation
  const validationChecks = [
    { check: 'Account Number Format', pass: validateAccountNumber(thirdPartyDetails.accountNumber) },
    { check: 'Company Name', pass: thirdPartyDetails.companyName.length > 0 },
    { check: 'Contact Information', pass: thirdPartyDetails.contactInfo.name.length > 0 },
    { check: 'Authorization Code', pass: !thirdPartyDetails.authorizationCode || thirdPartyDetails.authorizationCode.length >= 6 }
  ];
  
  console.log('🔍 [PAYMENT-AUTH] Third party validation checks:', validationChecks);
  
  const allChecksPassed = validationChecks.every(check => check.pass);
  
  // Simulate 92% success rate for third party billing
  const authSuccess = allChecksPassed && Math.random() > 0.08;
  
  if (authSuccess) {
    const authCode = generateAuthorizationCode('3P');
    console.log('✅ [PAYMENT-AUTH] Third party authorized:', { 
      accountNumber: maskAccountNumber(thirdPartyDetails.accountNumber), 
      authCode,
      company: thirdPartyDetails.companyName
    });
    
    return {
      authorized: true,
      authorizationCode: authCode,
      transactionId: `3P-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
  } else {
    const failedChecks = validationChecks.filter(check => !check.pass);
    const reason = failedChecks.length > 0 
      ? `Third party validation failed: ${failedChecks.map(c => c.check).join(', ')}`
      : 'Third party billing authorization declined';
    
    console.log('❌ [PAYMENT-AUTH] Third party authorization failed:', { reason });
    
    return {
      authorized: false,
      reason
    };
  }
}

/**
 * Authorize Net Terms payment
 */
async function authorizeNetTerms(paymentInfo: PaymentInfo): Promise<Omit<PaymentAuthorizationResult, 'processingTime' | 'method'>> {
  console.log('🏦 [PAYMENT-AUTH] Authorizing Net Terms...');
  
  if (!paymentInfo.paymentDetails) {
    throw new Error('Payment details are required');
  }
  
  const netTermsDetails = paymentInfo.paymentDetails.netTerms;
  if (!netTermsDetails) {
    throw new Error('Net Terms details are required');
  }
  
  // Simulate credit check and validation
  const validationChecks = [
    { check: 'Payment Period', pass: [15, 30, 45, 60].includes(netTermsDetails.period) },
    { check: 'Trade References', pass: netTermsDetails.tradeReferences.length >= 2 },
    { check: 'Annual Revenue', pass: netTermsDetails.annualRevenue.length > 0 },
    { check: 'Credit History', pass: Math.random() > 0.15 } // Simulate credit check
  ];
  
  console.log('🔍 [PAYMENT-AUTH] Net terms validation checks:', validationChecks);
  
  const allChecksPassed = validationChecks.every(check => check.pass);
  
  // Simulate 88% success rate for net terms (credit-dependent)
  const authSuccess = allChecksPassed && Math.random() > 0.12;
  
  if (authSuccess) {
    const authCode = generateAuthorizationCode('NET');
    console.log('✅ [PAYMENT-AUTH] Net terms authorized:', { 
      period: netTermsDetails.period, 
      authCode,
      tradeRefs: netTermsDetails.tradeReferences.length
    });
    
    return {
      authorized: true,
      authorizationCode: authCode,
      transactionId: `NET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
  } else {
    const failedChecks = validationChecks.filter(check => !check.pass);
    const reason = failedChecks.length > 0 
      ? `Net terms validation failed: ${failedChecks.map(c => c.check).join(', ')}`
      : 'Credit check declined for net terms';
    
    console.log('❌ [PAYMENT-AUTH] Net terms authorization failed:', { reason });
    
    return {
      authorized: false,
      reason
    };
  }
}

/**
 * Authorize Corporate Account payment
 */
async function authorizeCorporateAccount(paymentInfo: PaymentInfo): Promise<Omit<PaymentAuthorizationResult, 'processingTime' | 'method'>> {
  console.log('🏛️ [PAYMENT-AUTH] Authorizing Corporate Account...');
  
  if (!paymentInfo.paymentDetails) {
    throw new Error('Payment details are required');
  }
  
  const corporateDetails = paymentInfo.paymentDetails.corporate;
  if (!corporateDetails) {
    throw new Error('Corporate Account details are required');
  }
  
  // Simulate corporate account validation
  const validationChecks = [
    { check: 'Account Number Format', pass: validateAccountNumber(corporateDetails.accountNumber) },
    { check: 'Account PIN', pass: corporateDetails.accountPin.length >= 4 },
    { check: 'Billing Contact', pass: corporateDetails.billingContact.name.length > 0 },
    { check: 'Account Status', pass: Math.random() > 0.02 } // Simulate account standing check
  ];
  
  console.log('🔍 [PAYMENT-AUTH] Corporate account validation checks:', validationChecks);
  
  const allChecksPassed = validationChecks.every(check => check.pass);
  
  // Simulate 98% success rate for corporate accounts (most reliable)
  const authSuccess = allChecksPassed && Math.random() > 0.02;
  
  if (authSuccess) {
    const authCode = generateAuthorizationCode('CORP');
    console.log('✅ [PAYMENT-AUTH] Corporate account authorized:', { 
      accountNumber: maskAccountNumber(corporateDetails.accountNumber), 
      authCode,
      contact: corporateDetails.billingContact.name
    });
    
    return {
      authorized: true,
      authorizationCode: authCode,
      transactionId: `CORP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
  } else {
    const failedChecks = validationChecks.filter(check => !check.pass);
    const reason = failedChecks.length > 0 
      ? `Corporate account validation failed: ${failedChecks.map(c => c.check).join(', ')}`
      : 'Corporate account authorization declined';
    
    console.log('❌ [PAYMENT-AUTH] Corporate account authorization failed:', { reason });
    
    return {
      authorized: false,
      reason
    };
  }
}

/**
 * Get processing delay based on payment method complexity
 */
function getProcessingDelay(method: string): number {
  const delays: Record<string, number> = {
    'corporate': 200,   // Fastest - established accounts
    'bol': 400,         // Fast - standard freight billing
    'po': 600,          // Medium - requires PO validation
    'thirdparty': 900,  // Slower - requires third party verification
    'net': 1200         // Slowest - requires credit checks
  };
  
  const baseDelay = delays[method] || 500;
  const variation = Math.random() * 200 - 100; // ±100ms variation
  return Math.max(100, baseDelay + variation);
}

/**
 * Generate realistic authorization code
 */
function generateAuthorizationCode(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Validate PO number format
 */
function validatePONumber(poNumber: string): boolean {
  // PO numbers should be alphanumeric, 6-20 characters
  return /^[A-Za-z0-9\-_]{6,20}$/.test(poNumber);
}

/**
 * Validate BOL number format
 */
function validateBOLNumber(bolNumber: string): boolean {
  // BOL numbers should be alphanumeric, 8-25 characters
  return /^[A-Za-z0-9\-_]{8,25}$/.test(bolNumber);
}

/**
 * Validate account number format
 */
function validateAccountNumber(accountNumber: string): boolean {
  // Account numbers should be 8-16 digits
  return /^\d{8,16}$/.test(accountNumber);
}

/**
 * Mask account number for logging
 */
function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return '****';
  return accountNumber.slice(0, 4) + '*'.repeat(accountNumber.length - 8) + accountNumber.slice(-4);
}