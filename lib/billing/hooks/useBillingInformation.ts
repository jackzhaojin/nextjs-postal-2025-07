// Billing Information State Management Hook
// Task 6.2: Billing Information Form - React hook for managing billing state

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { 
  BillingInfo, UseBillingInformationReturn, BillingValidationStatus,
  BillingSectionType, BillingSectionStatus, SectionValidationStatus, BillingValidationError,
  SmartDefaults, SmartDefaultsConfidence
} from '../types';
import { validateBillingInfo, validateSection, validateCrossSection } from '../validation';
import { 
  saveBillingInfoToLocalStorage, 
  loadBillingInfoFromLocalStorage,
  clearBillingInfoFromLocalStorage,
  sanitizeBillingInfo,
  calculateBillingCompleteness,
  generateAddressDefaults,
  generateContactDefaults,
  generateCompanyDefaults,
  calculateDefaultsConfidence
} from '../utils';

const STORAGE_KEY = 'currentBillingInfo';
const AUTO_SAVE_DELAY = 1000; // 1 second

// Default billing info structure
const createDefaultBillingInfo = (): Partial<BillingInfo> => {
  console.log('Creating default billing info structure');
  
  return {
    sameAsOriginAddress: true,
    billingAddress: {
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isCommercial: true,
      isValidated: false,
      addressType: 'commercial'
    },
    accountsPayableContact: {
      fullName: '',
      title: 'Accounts Payable Manager',
      department: 'Accounting',
      phone: '',
      email: '',
      preferredContactMethod: 'email',
      isAuthorizedSigner: false,
      businessHours: {
        timezone: 'America/New_York',
        monday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        friday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        saturday: { isWorkday: false },
        sunday: { isWorkday: false }
      }
    },
    taxId: {
      taxIdNumber: '',
      taxIdType: 'ein',
      country: 'US',
      isValidated: false
    },
    companyInformation: {
      legalName: '',
      businessType: 'corporation',
      industry: 'manufacturing',
      annualShippingVolume: '50k-250k',
      ownershipType: 'private',
      isPubliclyTraded: false
    },
    invoicePreferences: {
      deliveryMethod: 'email',
      format: 'standard',
      frequency: 'per-shipment',
      language: 'english',
      currency: 'usd',
      purchaseOrderRequired: false,
      paymentTerms: {
        netDays: 30,
        creditCheckRequired: false,
        personalGuaranteeRequired: false,
        collateralRequired: false
      }
    },
    validationStatus: {
      isValid: false,
      completionPercentage: 0,
      sectionsComplete: {
        billingAddress: {
          isComplete: false,
          isValid: false,
          completionPercentage: 0,
          requiredFieldsComplete: false,
          hasErrors: false,
          hasWarnings: false,
          lastUpdated: new Date().toISOString()
        },
        accountsPayableContact: {
          isComplete: false,
          isValid: false,
          completionPercentage: 0,
          requiredFieldsComplete: false,
          hasErrors: false,
          hasWarnings: false,
          lastUpdated: new Date().toISOString()
        },
        companyInformation: {
          isComplete: false,
          isValid: false,
          completionPercentage: 0,
          requiredFieldsComplete: false,
          hasErrors: false,
          hasWarnings: false,
          lastUpdated: new Date().toISOString()
        },
        invoicePreferences: {
          isComplete: false,
          isValid: false,
          completionPercentage: 0,
          requiredFieldsComplete: false,
          hasErrors: false,
          hasWarnings: false,
          lastUpdated: new Date().toISOString()
        }
      },
      validationErrors: [],
      lastValidated: new Date().toISOString(),
      requiresReview: false
    },
    lastUpdated: new Date().toISOString()
  };
};

export function useBillingInformation(
  initialData?: Partial<BillingInfo>,
  originAddress?: any,
  originContact?: any,
  originCompany?: string
): UseBillingInformationReturn {
  console.log('Initializing useBillingInformation hook');
  
  // State management
  const [billingInfo, setBillingInfo] = useState<Partial<BillingInfo>>(() => {
    console.log('Initializing billing info state');
    
    // Try to load from localStorage first
    const stored = loadBillingInfoFromLocalStorage();
    if (stored) {
      console.log('Loaded billing info from localStorage');
      return stored;
    }
    
    // Use provided initial data or create default
    const defaultInfo = createDefaultBillingInfo();
    return initialData ? { ...defaultInfo, ...initialData } : defaultInfo;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationStatus, setValidationStatus] = useState<BillingValidationStatus>(
    billingInfo.validationStatus || createDefaultBillingInfo().validationStatus!
  );
  const [autoSaveTimeoutId, setAutoSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Smart defaults calculation
  const smartDefaults = useMemo((): SmartDefaults => {
    console.log('Calculating smart defaults');
    
    const addressDefaults = generateAddressDefaults(originAddress);
    const contactDefaults = generateContactDefaults(originContact);
    const companyDefaults = generateCompanyDefaults(originCompany);
    const confidence = calculateDefaultsConfidence(originAddress, originContact, originCompany);
    
    return {
      billingAddress: addressDefaults,
      accountsPayableContact: contactDefaults,
      companyInformation: companyDefaults,
      confidence,
      source: 'origin-address',
      appliedAt: new Date().toISOString()
    };
  }, [originAddress, originContact, originCompany]);
  
  // Auto-save functionality
  const autoSave = useCallback(() => {
    console.log('Auto-saving billing info');
    
    if (autoSaveTimeoutId) {
      clearTimeout(autoSaveTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      saveBillingInfoToLocalStorage(billingInfo);
      setHasUnsavedChanges(false);
      setIsSaving(false);
      console.log('Auto-save completed');
    }, AUTO_SAVE_DELAY);
    
    setAutoSaveTimeoutId(timeoutId);
  }, [billingInfo, autoSaveTimeoutId]);
  
  // Update billing information
  const updateBillingInfo = useCallback((updates: Partial<BillingInfo>) => {
    console.log('Updating billing info:', updates);
    
    setBillingInfo(prevInfo => {
      const updatedInfo = { 
        ...prevInfo, 
        ...updates, 
        lastUpdated: new Date().toISOString() 
      };
      
      // Sanitize the updated data
      const sanitized = sanitizeBillingInfo(updatedInfo);
      
      setHasUnsavedChanges(true);
      return sanitized;
    });
  }, []);
  
  // Reset billing information
  const resetBillingInfo = useCallback(() => {
    console.log('Resetting billing info');
    
    const defaultInfo = createDefaultBillingInfo();
    setBillingInfo(defaultInfo);
    setValidationStatus(defaultInfo.validationStatus!);
    setHasUnsavedChanges(true);
    clearBillingInfoFromLocalStorage();
  }, []);
  
  // Validate specific section
  const validateSectionData = useCallback(async (
    section: BillingSectionType
  ): Promise<SectionValidationStatus> => {
    console.log('Validating section:', section);
    
    setIsLoading(true);
    
    try {
      let sectionData: any;
      
      switch (section) {
        case 'billing-address':
          sectionData = billingInfo.billingAddress;
          break;
        case 'accounts-payable-contact':
          sectionData = billingInfo.accountsPayableContact;
          break;
        case 'company-information':
          sectionData = {
            companyInformation: billingInfo.companyInformation,
            taxId: billingInfo.taxId
          };
          break;
        case 'invoice-preferences':
          sectionData = billingInfo.invoicePreferences;
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      const result = await validateSection(section, sectionData);
      
      const sectionStatus: SectionValidationStatus = {
        isComplete: result.isValid && !result.errors.some(e => e.isBlocking),
        isValid: result.isValid,
        completionPercentage: result.isValid ? 100 : 0,
        requiredFieldsComplete: result.isValid,
        hasErrors: result.errors.some(e => e.severity === 'error'),
        hasWarnings: result.errors.some(e => e.severity === 'warning'),
        lastUpdated: new Date().toISOString()
      };
      
      // Update validation status
      setValidationStatus(prevStatus => ({
        ...prevStatus,
        sectionsComplete: {
          ...prevStatus.sectionsComplete,
          [section]: sectionStatus
        },
        validationErrors: [
          ...prevStatus.validationErrors.filter(e => e.section !== section),
          ...result.errors
        ],
        lastValidated: new Date().toISOString()
      }));
      
      return sectionStatus;
    } catch (error) {
      console.error('Section validation failed:', error);
      
      const errorStatus: SectionValidationStatus = {
        isComplete: false,
        isValid: false,
        completionPercentage: 0,
        requiredFieldsComplete: false,
        hasErrors: true,
        hasWarnings: false,
        lastUpdated: new Date().toISOString()
      };
      
      return errorStatus;
    } finally {
      setIsLoading(false);
    }
  }, [billingInfo]);
  
  // Validate all sections
  const validateAllSections = useCallback(async (): Promise<BillingValidationStatus> => {
    console.log('Validating all sections');
    
    setIsLoading(true);
    
    try {
      const fullBillingInfo = billingInfo as BillingInfo;
      const result = await validateBillingInfo(fullBillingInfo);
      
      // Validate each section individually
      const sections: BillingSectionType[] = [
        'billing-address',
        'accounts-payable-contact', 
        'company-information',
        'invoice-preferences'
      ];
      
      const sectionStatuses: Record<BillingSectionType, SectionValidationStatus> = {} as any;
      
      for (const section of sections) {
        sectionStatuses[section] = await validateSectionData(section);
      }
      
      const completionPercentage = calculateBillingCompleteness(billingInfo);
      
      // Convert section statuses to the expected format
      const sectionsComplete: BillingSectionStatus = {
        billingAddress: sectionStatuses['billing-address'],
        accountsPayableContact: sectionStatuses['accounts-payable-contact'],
        companyInformation: sectionStatuses['company-information'],
        invoicePreferences: sectionStatuses['invoice-preferences']
      };
      
      const newValidationStatus: BillingValidationStatus = {
        isValid: result.isValid,
        completionPercentage,
        sectionsComplete,
        validationErrors: result.errors,
        lastValidated: new Date().toISOString(),
        requiresReview: result.errors.some(e => e.severity === 'error' && e.isBlocking)
      };
      
      setValidationStatus(newValidationStatus);
      
      // Update billing info with validation status
      updateBillingInfo({ validationStatus: newValidationStatus });
      
      return newValidationStatus;
    } catch (error) {
      console.error('Full validation failed:', error);
      
      const errorStatus: BillingValidationStatus = {
        isValid: false,
        completionPercentage: 0,
        sectionsComplete: validationStatus.sectionsComplete,
        validationErrors: [{
          field: 'general',
          section: 'billing-address',
          errorCode: 'VALIDATION_FAILED',
          message: 'Validation process failed',
          severity: 'error',
          isBlocking: true
        }],
        lastValidated: new Date().toISOString(),
        requiresReview: true
      };
      
      setValidationStatus(errorStatus);
      return errorStatus;
    } finally {
      setIsLoading(false);
    }
  }, [billingInfo, updateBillingInfo, validateSectionData]);
  
  // Apply smart defaults
  const applySmartDefaults = useCallback(async (): Promise<void> => {
    console.log('Applying smart defaults');
    
    setIsLoading(true);
    
    try {
      const updates: Partial<BillingInfo> = {};
      
      // Apply address defaults if address is empty
      if (smartDefaults.billingAddress && 
          (!billingInfo.billingAddress?.streetAddress || billingInfo.sameAsOriginAddress)) {
        updates.billingAddress = {
          ...billingInfo.billingAddress,
          ...smartDefaults.billingAddress
        } as any;
      }
      
      // Apply contact defaults if contact is empty
      if (smartDefaults.accountsPayableContact &&
          !billingInfo.accountsPayableContact?.fullName) {
        updates.accountsPayableContact = {
          ...billingInfo.accountsPayableContact,
          ...smartDefaults.accountsPayableContact
        } as any;
      }
      
      // Apply company defaults if company is empty
      if (smartDefaults.companyInformation &&
          !billingInfo.companyInformation?.legalName) {
        updates.companyInformation = {
          ...billingInfo.companyInformation,
          ...smartDefaults.companyInformation
        } as any;
      }
      
      if (Object.keys(updates).length > 0) {
        updateBillingInfo(updates);
        console.log('Applied smart defaults:', updates);
      }
    } catch (error) {
      console.error('Failed to apply smart defaults:', error);
    } finally {
      setIsLoading(false);
    }
  }, [smartDefaults, billingInfo, updateBillingInfo]);
  
  // Save progress manually
  const saveProgress = useCallback(async (): Promise<void> => {
    console.log('Manually saving progress');
    
    setIsSaving(true);
    
    try {
      saveBillingInfoToLocalStorage(billingInfo);
      setHasUnsavedChanges(false);
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [billingInfo]);
  
  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSave();
    }
    
    return () => {
      if (autoSaveTimeoutId) {
        clearTimeout(autoSaveTimeoutId);
      }
    };
  }, [hasUnsavedChanges, autoSave, autoSaveTimeoutId]);
  
  // Auto-validation effect
  useEffect(() => {
    const validateTimeout = setTimeout(() => {
      validateAllSections();
    }, 2000); // Validate 2 seconds after changes
    
    return () => clearTimeout(validateTimeout);
  }, [billingInfo]); // Only re-run when billingInfo changes
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutId) {
        clearTimeout(autoSaveTimeoutId);
      }
    };
  }, [autoSaveTimeoutId]);
  
  // Completion percentage calculation
  const completionPercentage = useMemo(() => {
    return calculateBillingCompleteness(billingInfo);
  }, [billingInfo]);
  
  // Update completion percentage in validation status
  useEffect(() => {
    setValidationStatus(prevStatus => ({
      ...prevStatus,
      completionPercentage
    }));
  }, [completionPercentage]);
  
  console.log('useBillingInformation hook state:', {
    hasData: !!billingInfo,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    completionPercentage,
    isValid: validationStatus.isValid
  });
  
  return {
    billingInfo: billingInfo as BillingInfo,
    updateBillingInfo,
    resetBillingInfo,
    validateSection: validateSectionData,
    validateAllSections,
    applySmartDefaults,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    validationStatus,
    saveProgress
  };
}