'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Address, ShipmentDetails, ContactInfo, PackageInfo, DeliveryPreferences, PickupDetails } from '@/lib/types';
import { AddressValidator } from '@/lib/validation/addressValidation';
import { ShipmentValidator } from '@/lib/validation/shipmentValidation';

interface FormValidationState {
  errors: Record<string, string>;
  warnings: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  fieldValidation: Record<string, boolean>;
}

interface AutoSaveState {
  isAutoSaving: boolean;
  lastAutoSave: Date | null;
  autoSaveError: string | null;
  conflictDetected: boolean;
}

interface FormProgressState {
  percentage: number;
  completedFields: number;
  totalFields: number;
  requiredFieldsComplete: boolean;
  canAdvanceToNextStep: boolean;
}

interface UseShipmentDetailsFormOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  enableConflictResolution?: boolean;
  storageKey?: string;
}

interface UseShipmentDetailsFormReturn {
  // Form data
  shipmentDetails: ShipmentDetails;
  
  // Validation state
  validation: FormValidationState;
  
  // Auto-save state
  autoSave: AutoSaveState;
  
  // Progress tracking
  progress: FormProgressState;
  
  // Form actions
  updateOrigin: (address: Partial<Address>) => void;
  updateDestination: (address: Partial<Address>) => void;
  updatePackage: (packageInfo: Partial<PackageInfo>) => void;
  updateDeliveryPreferences: (preferences: Partial<DeliveryPreferences>) => void;
  updatePickupDetails: (pickupDetails: Partial<PickupDetails>) => Promise<void>;
  
  // Field-level actions
  setFieldValue: (fieldPath: string, value: any) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  validateField: (field: string) => void;
  validateAll: () => boolean;
  
  // Form state
  isDirty: boolean;
  isLoading: boolean;
  
  // Actions
  save: () => Promise<void>;
  reset: () => void;
  forceSync: () => Promise<void>;
  resolveConflict: (strategy: 'local' | 'remote' | 'merge') => Promise<void>;
  
  // Navigation helpers
  canNavigateNext: () => boolean;
  getValidationSummary: () => { errors: string[]; warnings: string[] };
}

const defaultContactInfo: ContactInfo = {
  name: '',
  phone: '',
  email: '',
  company: '',
  extension: ''
};

const defaultAddress: Address = {
  address: '',
  suite: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  isResidential: false,
  locationType: 'commercial',
  locationDescription: '',
  contactInfo: defaultContactInfo
};

const defaultShipmentDetails: ShipmentDetails = {
  origin: defaultAddress,
  destination: defaultAddress,
  package: {
    type: 'small',
    dimensions: { length: 0, width: 0, height: 0, unit: 'in' },
    weight: { value: 0, unit: 'lbs' },
    declaredValue: 0,
    currency: 'USD',
    contents: '',
    contentsCategory: 'other',
    specialHandling: []
  },
  deliveryPreferences: {
    signatureRequired: false,
    adultSignatureRequired: false,
    smsConfirmation: false,
    photoProof: false,
    saturdayDelivery: false,
    holdAtLocation: false,
    serviceLevel: 'reliable'
  }
};

export function useShipmentDetailsForm(
  initialData?: Partial<ShipmentDetails>,
  options: UseShipmentDetailsFormOptions = {}
) {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    validateOnChange = true,
    validateOnBlur = true,
    enableConflictResolution = true,
    storageKey = 'currentShipmentDetails'
  } = options;

  console.log('useShipmentDetailsForm: Initializing advanced form state management');
  console.log('useShipmentDetailsForm: Options:', options);
  console.log('useShipmentDetailsForm: Initial data:', initialData);

  // Form state
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>(() => {
    // Try to load from localStorage first, then use initial data, then defaults
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('useShipmentDetailsForm: Loaded from localStorage:', parsed);
          return { ...defaultShipmentDetails, ...parsed, ...initialData };
        }
      } catch (error) {
        console.error('useShipmentDetailsForm: Error loading from localStorage:', error);
      }
    }
    return { ...defaultShipmentDetails, ...initialData };
  });

  const [validation, setValidation] = useState<FormValidationState>({
    errors: {},
    warnings: {},
    touched: {},
    isValid: false,
    fieldValidation: {}
  });

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isAutoSaving: false,
    lastAutoSave: null,
    autoSaveError: null,
    conflictDetected: false
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for managing auto-save and conflict detection
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  
  // Ref to track current shipment details for stable access in callbacks
  const shipmentDetailsRef = useRef<ShipmentDetails>(shipmentDetails);
  const instanceIdRef = useRef<string>(Math.random().toString(36).substr(2, 9));

  // Keep ref updated
  useEffect(() => {
    shipmentDetailsRef.current = shipmentDetails;
  }, [shipmentDetails]);

  console.log('useShipmentDetailsForm: Current state - isDirty:', isDirty, 'isValid:', validation.isValid);

  // Calculate progress state
  const progress = useMemo(() => {
    const progressData = ShipmentValidator.calculateCompletionProgress(shipmentDetailsRef.current, 'shipment-details');
    
    console.log('useShipmentDetailsForm: Progress calculation:', {
      progressData,
      errorsCount: Object.keys(validation.errors).length,
      validationIsValid: validation.isValid,
      shipmentData: shipmentDetailsRef.current
    });
    
    // More lenient approach for shipment details page: 
    // Allow progression if basic required fields are filled, even if there are minor validation warnings
    const hasNoVisibleErrors = Object.keys(validation.errors).length === 0;
    const hasCriticalAddressInfo = shipmentDetailsRef.current.origin?.address && 
                                  shipmentDetailsRef.current.origin?.city &&
                                  shipmentDetailsRef.current.destination?.address && 
                                  shipmentDetailsRef.current.destination?.city;
    const hasBasicPackageInfo = shipmentDetailsRef.current.package?.weight?.value > 0;
    
    // Enable Get Quotes if we have addresses and basic package info, OR if validation shows no errors
    const canAdvanceToNextStep = hasNoVisibleErrors || (hasCriticalAddressInfo && hasBasicPackageInfo) || progressData.requiredFieldsComplete;
    
    console.log('useShipmentDetailsForm: Calculated canAdvanceToNextStep:', {
      canAdvanceToNextStep,
      hasNoVisibleErrors,
      hasCriticalAddressInfo,
      hasBasicPackageInfo,
      requiredFieldsComplete: progressData.requiredFieldsComplete
    });
    
    return {
      ...progressData,
      requiredFieldsComplete: hasNoVisibleErrors || progressData.requiredFieldsComplete,
      canAdvanceToNextStep
    };
  }, [validation.isValid, validation.errors]);

  // Multi-tab conflict detection
  const detectConflicts = useCallback(() => {
    if (!enableConflictResolution || typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(storageKey);
      const storedInstanceId = localStorage.getItem(`${storageKey}_instance`);
      
      if (stored && storedInstanceId !== instanceIdRef.current) {
        const currentSerialized = JSON.stringify(shipmentDetailsRef.current);
        if (stored !== lastSavedDataRef.current && stored !== currentSerialized) {
          console.log('useShipmentDetailsForm: Conflict detected with another tab');
          setAutoSaveState(prev => ({ ...prev, conflictDetected: true }));
          return true;
        }
      }
    } catch (error) {
      console.error('useShipmentDetailsForm: Error detecting conflicts:', error);
    }
    
    return false;
  }, [enableConflictResolution, storageKey]);

  // Auto-save functionality with conflict resolution
  const triggerAutoSave = useCallback(async () => {
    if (!autoSave || !isDirty) return;
    
    // Check current autoSave state via ref to avoid dependency
    const currentAutoSaveState = autoSaveState;
    if (currentAutoSaveState.isAutoSaving) return;

    console.log('useShipmentDetailsForm: Triggering auto-save');
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaveState(prev => ({ ...prev, isAutoSaving: true, autoSaveError: null }));
        
        // Check for conflicts before saving
        if (detectConflicts()) {
          return;
        }

        const serialized = JSON.stringify(shipmentDetailsRef.current);
        
        // Simulate network delay for realistic auto-save behavior
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Save to localStorage
        localStorage.setItem(storageKey, serialized);
        localStorage.setItem(`${storageKey}_instance`, instanceIdRef.current);
        localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
        
        lastSavedDataRef.current = serialized;
        setIsDirty(false);
        
        setAutoSaveState(prev => ({
          ...prev,
          isAutoSaving: false,
          lastAutoSave: new Date(),
          autoSaveError: null
        }));
        
        console.log('useShipmentDetailsForm: Auto-save completed successfully');
      } catch (error) {
        console.error('useShipmentDetailsForm: Auto-save failed:', error);
        setAutoSaveState(prev => ({
          ...prev,
          isAutoSaving: false,
          autoSaveError: error instanceof Error ? error.message : 'Auto-save failed'
        }));
      }
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay, isDirty, storageKey, detectConflicts]);

  // Enhanced validation with real-time feedback
  const validateField = useCallback((fieldPath: string) => {
    console.log('useShipmentDetailsForm: Validating field:', fieldPath);
    
    // Use callback to get fresh state at validation time
    setValidation(prev => {
      // Get the current shipment details from the latest state
      const currentShipmentDetails = shipmentDetailsRef.current;
      const value = getNestedValue(currentShipmentDetails, fieldPath);
      const fieldValidation = ShipmentValidator.validateField(fieldPath, value, currentShipmentDetails);
      
      return {
        ...prev,
        errors: { ...prev.errors, ...fieldValidation.errors },
        warnings: { ...prev.warnings, ...fieldValidation.warnings },
        fieldValidation: { ...prev.fieldValidation, ...fieldValidation.fieldValidation }
      };
    });

    console.log('useShipmentDetailsForm: Field validation completed for:', fieldPath);
  }, []);

  const validateAll = useCallback(() => {
    console.log('useShipmentDetailsForm: Running comprehensive validation');
    
    const fullValidation = ShipmentValidator.validateShipmentDetails(shipmentDetailsRef.current);
    
    setValidation(prev => ({
      ...prev,
      errors: fullValidation.errors,
      warnings: fullValidation.warnings,
      isValid: fullValidation.isValid,
      fieldValidation: fullValidation.fieldValidation
    }));

    console.log('useShipmentDetailsForm: Full validation result:', fullValidation);
    return fullValidation.isValid;
  }, []);

  // Helper function to get nested values
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper function to set nested values
  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      } else {
        current[keys[i]] = { ...current[keys[i]] };
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  };

  // Generic field value setter
  const setFieldValue = useCallback((fieldPath: string, value: any) => {
    console.log('useShipmentDetailsForm: Setting field value:', fieldPath, '=', value);
    
    setShipmentDetails(prev => setNestedValue(prev, fieldPath, value));
    setIsDirty(true);

    // Mark field as touched
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldPath]: true }
    }));

    // Validate field if enabled
    if (validateOnChange) {
      setTimeout(() => validateField(fieldPath), 0);
    }
  }, [validateOnChange]);

  // Specific update functions
  const updateOrigin = useCallback((address: Partial<Address>) => {
    console.log('useShipmentDetailsForm: Updating origin address:', address);
    setShipmentDetails(prev => ({ 
      ...prev, 
      origin: { ...prev.origin, ...address }
    }));
    setIsDirty(true);

    if (validateOnChange) {
      setTimeout(() => {
        Object.keys(address).forEach(key => {
          validateField(`origin.${key}`);
        });
      }, 0);
    }
  }, [validateOnChange]);

  const updateDestination = useCallback((address: Partial<Address>) => {
    console.log('useShipmentDetailsForm: Updating destination address:', address);
    setShipmentDetails(prev => ({ 
      ...prev, 
      destination: { ...prev.destination, ...address }
    }));
    setIsDirty(true);

    if (validateOnChange) {
      setTimeout(() => {
        Object.keys(address).forEach(key => {
          validateField(`destination.${key}`);
        });
      }, 0);
    }
  }, [validateOnChange]);

  const updatePackage = useCallback((packageInfo: Partial<PackageInfo>) => {
    console.log('useShipmentDetailsForm: Updating package info:', packageInfo);
    setShipmentDetails(prev => ({ 
      ...prev, 
      package: { ...prev.package, ...packageInfo }
    }));
    setIsDirty(true);

    if (validateOnChange) {
      setTimeout(() => {
        Object.keys(packageInfo).forEach(key => {
          validateField(`package.${key}`);
        });
      }, 0);
    }
  }, [validateOnChange]);

  const updateDeliveryPreferences = useCallback((preferences: Partial<DeliveryPreferences>) => {
    console.log('useShipmentDetailsForm: Updating delivery preferences:', preferences);
    setShipmentDetails(prev => ({ 
      ...prev, 
      deliveryPreferences: { ...prev.deliveryPreferences, ...preferences }
    }));
    setIsDirty(true);
  }, []);

  const updatePickupDetails = useCallback(async (pickupDetails: Partial<PickupDetails>) => {
    console.log('useShipmentDetailsForm: Updating pickup details:', pickupDetails);
    setShipmentDetails(prev => ({ 
      ...prev, 
      pickupDetails: prev.pickupDetails 
        ? { ...prev.pickupDetails, ...pickupDetails } 
        : pickupDetails as PickupDetails
    }));
    setIsDirty(true);

    // Save immediately after state update
    setTimeout(async () => {
      try {
        const serialized = JSON.stringify(shipmentDetailsRef.current);
        localStorage.setItem(storageKey, serialized);
        console.log('useShipmentDetailsForm: Pickup details auto-saved successfully');
      } catch (error) {
        console.error('useShipmentDetailsForm: Failed to auto-save pickup details:', error);
      }
    }, 100);
  }, [storageKey]);

  // Set field as touched
  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched }
    }));

    if (touched && validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur]);

  // Manual save function
  const save = useCallback(async () => {
    console.log('useShipmentDetailsForm: Manual save triggered');
    setIsLoading(true);
    
    try {
      // Validate before saving
      const isValid = validateAll();
      if (!isValid) {
        throw new Error('Cannot save invalid form data');
      }

      // Check for conflicts
      if (detectConflicts()) {
        throw new Error('Conflict detected - please resolve before saving');
      }

      const serialized = JSON.stringify(shipmentDetailsRef.current);
      
      // Save to localStorage
      localStorage.setItem(storageKey, serialized);
      localStorage.setItem(`${storageKey}_instance`, instanceIdRef.current);
      localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
      
      lastSavedDataRef.current = serialized;
      setIsDirty(false);
      
      setAutoSaveState(prev => ({
        ...prev,
        lastAutoSave: new Date(),
        autoSaveError: null
      }));
      
      console.log('useShipmentDetailsForm: Manual save completed');
    } catch (error) {
      console.error('useShipmentDetailsForm: Manual save failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, validateAll, detectConflicts]);

  // Reset form to default state
  const reset = useCallback(() => {
    console.log('useShipmentDetailsForm: Resetting form');
    setShipmentDetails(defaultShipmentDetails);
    setValidation({
      errors: {},
      warnings: {},
      touched: {},
      isValid: false,
      fieldValidation: {}
    });
    setIsDirty(false);
    
    // Clear localStorage
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_instance`);
    localStorage.removeItem(`${storageKey}_timestamp`);
  }, [storageKey]);

  // Force sync with localStorage
  const forceSync = useCallback(async () => {
    console.log('useShipmentDetailsForm: Force sync triggered');
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setShipmentDetails(parsed);
        setIsDirty(false);
        setAutoSaveState(prev => ({ ...prev, conflictDetected: false }));
        
        // Re-validate after sync
        setTimeout(() => validateAll(), 0);
        
        console.log('useShipmentDetailsForm: Force sync completed');
      }
    } catch (error) {
      console.error('useShipmentDetailsForm: Force sync failed:', error);
      throw error;
    }
  }, [storageKey, validateAll]);

  // Conflict resolution
  const resolveConflict = useCallback(async (strategy: 'local' | 'remote' | 'merge') => {
    console.log('useShipmentDetailsForm: Resolving conflict with strategy:', strategy);
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      
      const remoteData = JSON.parse(stored);
      
      switch (strategy) {
        case 'local':
          // Keep local data, overwrite remote
          await save();
          break;
          
        case 'remote':
          // Use remote data, discard local changes
          setShipmentDetails(remoteData);
          setIsDirty(false);
          break;
          
        case 'merge':
          // Merge non-conflicting fields (simplified merge strategy)
          const merged = { ...remoteData, ...shipmentDetailsRef.current };
          setShipmentDetails(merged);
          setIsDirty(true);
          break;
      }
      
      setAutoSaveState(prev => ({ ...prev, conflictDetected: false }));
      console.log('useShipmentDetailsForm: Conflict resolved');
    } catch (error) {
      console.error('useShipmentDetailsForm: Conflict resolution failed:', error);
      throw error;
    }
  }, [storageKey, save]);

  // Navigation helpers
  const canNavigateNext = useCallback(() => {
    return progress.requiredFieldsComplete && validation.isValid;
  }, [progress.requiredFieldsComplete, validation.isValid]);

  const getValidationSummary = useCallback(() => {
    const errors = Object.values(validation.errors);
    const warnings = Object.values(validation.warnings);
    return { errors, warnings };
  }, [validation.errors, validation.warnings]);

  // Auto-save effect
  useEffect(() => {
    if (isDirty && autoSave) {
      triggerAutoSave();
    }
  }, [isDirty, autoSave, triggerAutoSave]);

    // Trigger auto-save when form data changes
  useEffect(() => {
    if (isDirty) {
      triggerAutoSave();
    }
  }, [isDirty, triggerAutoSave]);

  // Enhanced validation trigger - validate immediately when key fields change
  useEffect(() => {
    console.log('useShipmentDetailsForm: Shipment details changed, triggering validation');
    
    // Run validation after a short delay to avoid excessive validation during rapid changes
    const validateTimeout = setTimeout(() => {
      validateAll();
    }, 300);

    return () => clearTimeout(validateTimeout);
  }, [shipmentDetails, validateAll]);

  // Initial validation - only run if form has been touched or has existing data
  useEffect(() => {
    // Only validate if we have touched fields or if the form has data from localStorage
    const hasTouchedFields = Object.keys(validation.touched).length > 0;
    const hasExistingData = JSON.stringify(shipmentDetailsRef.current) !== JSON.stringify(defaultShipmentDetails);
    
    if (hasTouchedFields || hasExistingData) {
      validateAll();
    }
  }, [validateAll, validation.touched]);

  // Conflict detection on focus
  useEffect(() => {
    const handleFocus = () => {
      if (enableConflictResolution) {
        detectConflicts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enableConflictResolution, detectConflicts]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  console.log('useShipmentDetailsForm: Returning form state and actions');

  return {
    shipmentDetails,
    validation,
    autoSave: autoSaveState,
    progress,
    updateOrigin,
    updateDestination,
    updatePackage,
    updateDeliveryPreferences,
    updatePickupDetails,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateAll,
    isDirty,
    isLoading,
    save,
    reset,
    forceSync,
    resolveConflict,
    canNavigateNext,
    getValidationSummary
  };
}