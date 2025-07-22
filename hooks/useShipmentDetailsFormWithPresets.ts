'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Address, ShipmentDetails, ContactInfo, PackageInfo, DeliveryPreferences, ShippingTransaction } from '@/lib/types';
import { AddressValidator } from '@/lib/validation/addressValidation';
import { ShipmentValidator } from '@/lib/validation/shipmentValidation';
import { ShippingPreset, PresetSelectionState } from '@/lib/presets/shipping-presets';
import { 
  mergePresetWithTransaction, 
  detectModifiedFields, 
  createInitialPresetState,
  updatePresetState,
  resetPresetState
} from '@/lib/presets/preset-utils';

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
  presetStorageKey?: string;
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
  
  // Preset state
  presetState: PresetSelectionState;
  
  // Form actions
  updateOrigin: (address: Partial<Address>) => void;
  updateDestination: (address: Partial<Address>) => void;
  updatePackage: (packageInfo: Partial<PackageInfo>) => void;
  updateDeliveryPreferences: (preferences: Partial<DeliveryPreferences>) => void;
  
  // Field-level actions
  setFieldValue: (fieldPath: string, value: any) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  validateField: (field: string) => void;
  validateAll: () => boolean;
  
  // Preset actions
  applyPreset: (preset: ShippingPreset) => void;
  clearPreset: () => void;
  
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

export function useShipmentDetailsFormWithPresets(
  initialData?: Partial<ShipmentDetails>,
  options: UseShipmentDetailsFormOptions = {}
) {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    validateOnChange = true,
    validateOnBlur = true,
    enableConflictResolution = true,
    storageKey = 'currentShipmentDetails',
    presetStorageKey = 'currentPresetState'
  } = options;

  console.log('📋 [FORM-WITH-PRESETS] Initializing enhanced form with preset support');
  console.log('📋 [FORM-WITH-PRESETS] Options:', options);

  // Form state
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>(() => {
    // Try to load from localStorage first, then use initial data, then defaults
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('📋 [FORM-WITH-PRESETS] Loaded from localStorage:', parsed);
          return { ...defaultShipmentDetails, ...parsed, ...initialData };
        }
      } catch (error) {
        console.error('📋 [FORM-WITH-PRESETS] Error loading from localStorage:', error);
      }
    }
    return { ...defaultShipmentDetails, ...initialData };
  });

  // Preset state
  const [presetState, setPresetState] = useState<PresetSelectionState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(presetStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('📋 [FORM-WITH-PRESETS] Loaded preset state:', parsed);
          return parsed;
        }
      } catch (error) {
        console.error('📋 [FORM-WITH-PRESETS] Error loading preset state:', error);
      }
    }
    return createInitialPresetState();
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
  const lastSavedPresetRef = useRef<string>('');
  
  // Ref to track current shipment details for stable access in callbacks
  const shipmentDetailsRef = useRef<ShipmentDetails>(shipmentDetails);
  const presetStateRef = useRef<PresetSelectionState>(presetState);
  const instanceIdRef = useRef<string>(Math.random().toString(36).substr(2, 9));

  // Keep refs updated
  useEffect(() => {
    shipmentDetailsRef.current = shipmentDetails;
  }, [shipmentDetails]);

  useEffect(() => {
    presetStateRef.current = presetState;
  }, [presetState]);

  console.log('📋 [FORM-WITH-PRESETS] Current state:', {
    isDirty,
    isValid: validation.isValid,
    selectedPresetId: presetState.selectedPresetId,
    isModified: presetState.isModified,
    modifiedFieldsCount: presetState.modifiedFields.length
  });

  // Calculate progress state
  const progress = useMemo(() => {
    const progressData = ShipmentValidator.calculateCompletionProgress(shipmentDetailsRef.current, 'shipment-details');
    
    console.log('📋 [FORM-WITH-PRESETS] Progress calculation:', {
      progressData,
      errorsCount: Object.keys(validation.errors).length,
      validationIsValid: validation.isValid
    });
    
    // More lenient approach for shipment details page
    const hasNoVisibleErrors = Object.keys(validation.errors).length === 0;
    const hasCriticalAddressInfo = shipmentDetailsRef.current.origin?.address && 
                                  shipmentDetailsRef.current.origin?.city &&
                                  shipmentDetailsRef.current.destination?.address && 
                                  shipmentDetailsRef.current.destination?.city;
    const hasBasicPackageInfo = shipmentDetailsRef.current.package?.weight?.value > 0;
    
    const canAdvanceToNextStep = hasNoVisibleErrors || (hasCriticalAddressInfo && hasBasicPackageInfo) || progressData.requiredFieldsComplete;
    
    return {
      ...progressData,
      requiredFieldsComplete: hasNoVisibleErrors || progressData.requiredFieldsComplete,
      canAdvanceToNextStep
    };
  }, [validation.isValid, validation.errors]);

  // Apply preset functionality
  const applyPreset = useCallback((preset: ShippingPreset) => {
    console.log('📋 [FORM-WITH-PRESETS] Applying preset:', {
      presetId: preset.id,
      presetName: preset.name,
      category: preset.category
    });

    // Create merged transaction with preset data
    const existingTransaction: Partial<ShippingTransaction> = {
      id: instanceIdRef.current,
      shipmentDetails: shipmentDetailsRef.current,
      status: 'draft'
    };

    const mergedTransaction = mergePresetWithTransaction(preset, existingTransaction);
    
    // Update shipment details
    setShipmentDetails(mergedTransaction.shipmentDetails);
    
    // Update preset state
    const newPresetState = updatePresetState(presetStateRef.current, {
      selectedPresetId: preset.id,
      isModified: false,
      modifiedFields: []
    });
    
    setPresetState(newPresetState);
    setIsDirty(true);

    console.log('📋 [FORM-WITH-PRESETS] Preset applied successfully:', {
      presetId: preset.id,
      hasOrigin: !!mergedTransaction.shipmentDetails.origin,
      hasDestination: !!mergedTransaction.shipmentDetails.destination,
      packageType: mergedTransaction.shipmentDetails.package?.type
    });

    // Validate after preset application
    setTimeout(() => {
      validateAll();
    }, 100);
  }, []);

  // Clear preset functionality
  const clearPreset = useCallback(() => {
    console.log('📋 [FORM-WITH-PRESETS] Clearing preset');

    // Reset to default form state
    setShipmentDetails(defaultShipmentDetails);
    setPresetState(resetPresetState());
    setIsDirty(true);

    // Clear validation errors
    setValidation({
      errors: {},
      warnings: {},
      touched: {},
      isValid: false,
      fieldValidation: {}
    });

    console.log('📋 [FORM-WITH-PRESETS] Preset cleared successfully');
  }, []);

  // Detect field modifications from preset
  const detectPresetModifications = useCallback(() => {
    if (!presetState.selectedPresetId) return;

    // This would need to be enhanced to track specific field modifications
    // For now, we'll mark as modified when any field changes after preset selection
    console.log('📋 [FORM-WITH-PRESETS] Checking for preset modifications');
    
    // Simple detection - mark as modified if isDirty and we have a preset selected
    if (isDirty && presetState.selectedPresetId && !presetState.isModified) {
      const newPresetState = updatePresetState(presetState, {
        isModified: true,
        modifiedFields: ['general'] // Simplified - would need more granular tracking
      });
      setPresetState(newPresetState);
    }
  }, [presetState, isDirty]);

  // Multi-tab conflict detection
  const detectConflicts = useCallback(() => {
    if (!enableConflictResolution || typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(storageKey);
      const storedInstanceId = localStorage.getItem(`${storageKey}_instance`);
      
      if (stored && storedInstanceId !== instanceIdRef.current) {
        const currentSerialized = JSON.stringify(shipmentDetailsRef.current);
        if (stored !== lastSavedDataRef.current && stored !== currentSerialized) {
          console.log('📋 [FORM-WITH-PRESETS] Conflict detected with another tab');
          setAutoSaveState(prev => ({ ...prev, conflictDetected: true }));
          return true;
        }
      }
    } catch (error) {
      console.error('📋 [FORM-WITH-PRESETS] Error detecting conflicts:', error);
    }
    
    return false;
  }, [enableConflictResolution, storageKey]);

  // Auto-save functionality with preset state
  const triggerAutoSave = useCallback(async () => {
    if (!autoSave || !isDirty) return;
    
    if (autoSaveState.isAutoSaving) return;

    console.log('📋 [FORM-WITH-PRESETS] Triggering auto-save with preset state');
    
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

        const formSerialized = JSON.stringify(shipmentDetailsRef.current);
        const presetSerialized = JSON.stringify(presetStateRef.current);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Save both form data and preset state
        localStorage.setItem(storageKey, formSerialized);
        localStorage.setItem(presetStorageKey, presetSerialized);
        localStorage.setItem(`${storageKey}_instance`, instanceIdRef.current);
        localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
        
        lastSavedDataRef.current = formSerialized;
        lastSavedPresetRef.current = presetSerialized;
        setIsDirty(false);
        
        setAutoSaveState(prev => ({
          ...prev,
          isAutoSaving: false,
          lastAutoSave: new Date(),
          autoSaveError: null
        }));
        
        console.log('📋 [FORM-WITH-PRESETS] Auto-save completed successfully');
      } catch (error) {
        console.error('📋 [FORM-WITH-PRESETS] Auto-save failed:', error);
        setAutoSaveState(prev => ({
          ...prev,
          isAutoSaving: false,
          autoSaveError: error instanceof Error ? error.message : 'Auto-save failed'
        }));
      }
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay, isDirty, storageKey, presetStorageKey, detectConflicts]);

  // Enhanced validation
  const validateField = useCallback((fieldPath: string) => {
    console.log('📋 [FORM-WITH-PRESETS] Validating field:', fieldPath);
    
    setValidation(prev => {
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

    console.log('📋 [FORM-WITH-PRESETS] Field validation completed for:', fieldPath);
  }, []);

  const validateAll = useCallback(() => {
    console.log('📋 [FORM-WITH-PRESETS] Running comprehensive validation');
    
    const fullValidation = ShipmentValidator.validateShipmentDetails(shipmentDetailsRef.current);
    
    setValidation(prev => ({
      ...prev,
      errors: fullValidation.errors,
      warnings: fullValidation.warnings,
      isValid: fullValidation.isValid,
      fieldValidation: fullValidation.fieldValidation
    }));

    console.log('📋 [FORM-WITH-PRESETS] Full validation result:', fullValidation);
    return fullValidation.isValid;
  }, []);

  // Helper functions
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

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

  // Generic field value setter with preset modification tracking
  const setFieldValue = useCallback((fieldPath: string, value: any) => {
    console.log('📋 [FORM-WITH-PRESETS] Setting field value:', fieldPath, '=', value);
    
    setShipmentDetails(prev => setNestedValue(prev, fieldPath, value));
    setIsDirty(true);

    // Mark field as touched
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldPath]: true }
    }));

    // Track preset modifications
    if (presetState.selectedPresetId && !presetState.isModified) {
      const newPresetState = updatePresetState(presetState, {
        isModified: true,
        modifiedFields: [...presetState.modifiedFields, fieldPath]
      });
      setPresetState(newPresetState);
    }

    // Validate field if enabled
    if (validateOnChange) {
      setTimeout(() => validateField(fieldPath), 0);
    }
  }, [validateOnChange, presetState]);

  // Specific update functions with preset tracking
  const updateOrigin = useCallback((address: Partial<Address>) => {
    console.log('📋 [FORM-WITH-PRESETS] Updating origin address:', address);
    setShipmentDetails(prev => ({ 
      ...prev, 
      origin: { ...prev.origin, ...address }
    }));
    setIsDirty(true);

    // Track preset modifications
    if (presetState.selectedPresetId && !presetState.isModified) {
      const modifiedFields = Object.keys(address).map(key => `origin.${key}`);
      const newPresetState = updatePresetState(presetState, {
        isModified: true,
        modifiedFields: [...presetState.modifiedFields, ...modifiedFields]
      });
      setPresetState(newPresetState);
    }

    if (validateOnChange) {
      setTimeout(() => {
        Object.keys(address).forEach(key => {
          validateField(`origin.${key}`);
        });
      }, 0);
    }
  }, [validateOnChange, presetState]);

  const updateDestination = useCallback((address: Partial<Address>) => {
    console.log('📋 [FORM-WITH-PRESETS] Updating destination address:', address);
    setShipmentDetails(prev => ({ 
      ...prev, 
      destination: { ...prev.destination, ...address }
    }));
    setIsDirty(true);

    // Track preset modifications
    if (presetState.selectedPresetId && !presetState.isModified) {
      const modifiedFields = Object.keys(address).map(key => `destination.${key}`);
      const newPresetState = updatePresetState(presetState, {
        isModified: true,
        modifiedFields: [...presetState.modifiedFields, ...modifiedFields]
      });
      setPresetState(newPresetState);
    }

    if (validateOnChange) {
      setTimeout(() => {
        Object.keys(address).forEach(key => {
          validateField(`destination.${key}`);
        });
      }, 0);
    }
  }, [validateOnChange, presetState]);

  const updatePackage = useCallback((packageInfo: Partial<PackageInfo>) => {
    console.log('📋 [FORM-WITH-PRESETS] Updating package info:', packageInfo);
    setShipmentDetails(prev => ({ 
      ...prev, 
      package: { ...prev.package, ...packageInfo }
    }));
    setIsDirty(true);

    // Track preset modifications
    if (presetState.selectedPresetId && !presetState.isModified) {
      const modifiedFields = Object.keys(packageInfo).map(key => `package.${key}`);
      const newPresetState = updatePresetState(presetState, {
        isModified: true,
        modifiedFields: [...presetState.modifiedFields, ...modifiedFields]
      });
      setPresetState(newPresetState);
    }

    if (validateOnChange) {
      setTimeout(() => {
        Object.keys(packageInfo).forEach(key => {
          validateField(`package.${key}`);
        });
      }, 0);
    }
  }, [validateOnChange, presetState]);

  const updateDeliveryPreferences = useCallback((preferences: Partial<DeliveryPreferences>) => {
    console.log('📋 [FORM-WITH-PRESETS] Updating delivery preferences:', preferences);
    setShipmentDetails(prev => ({ 
      ...prev, 
      deliveryPreferences: { ...prev.deliveryPreferences, ...preferences }
    }));
    setIsDirty(true);

    // Track preset modifications
    if (presetState.selectedPresetId && !presetState.isModified) {
      const modifiedFields = Object.keys(preferences).map(key => `deliveryPreferences.${key}`);
      const newPresetState = updatePresetState(presetState, {
        isModified: true,
        modifiedFields: [...presetState.modifiedFields, ...modifiedFields]
      });
      setPresetState(newPresetState);
    }
  }, [presetState]);

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
    console.log('📋 [FORM-WITH-PRESETS] Manual save triggered');
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

      const formSerialized = JSON.stringify(shipmentDetailsRef.current);
      const presetSerialized = JSON.stringify(presetStateRef.current);
      
      // Save to localStorage
      localStorage.setItem(storageKey, formSerialized);
      localStorage.setItem(presetStorageKey, presetSerialized);
      localStorage.setItem(`${storageKey}_instance`, instanceIdRef.current);
      localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
      
      lastSavedDataRef.current = formSerialized;
      lastSavedPresetRef.current = presetSerialized;
      setIsDirty(false);
      
      setAutoSaveState(prev => ({
        ...prev,
        lastAutoSave: new Date(),
        autoSaveError: null
      }));
      
      console.log('📋 [FORM-WITH-PRESETS] Manual save completed');
    } catch (error) {
      console.error('📋 [FORM-WITH-PRESETS] Manual save failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, presetStorageKey, validateAll, detectConflicts]);

  // Reset form to default state
  const reset = useCallback(() => {
    console.log('📋 [FORM-WITH-PRESETS] Resetting form');
    setShipmentDetails(defaultShipmentDetails);
    setPresetState(resetPresetState());
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
    localStorage.removeItem(presetStorageKey);
    localStorage.removeItem(`${storageKey}_instance`);
    localStorage.removeItem(`${storageKey}_timestamp`);
  }, [storageKey, presetStorageKey]);

  // Force sync with localStorage
  const forceSync = useCallback(async () => {
    console.log('📋 [FORM-WITH-PRESETS] Force sync triggered');
    
    try {
      const stored = localStorage.getItem(storageKey);
      const presetStored = localStorage.getItem(presetStorageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setShipmentDetails(parsed);
      }
      
      if (presetStored) {
        const parsedPreset = JSON.parse(presetStored);
        setPresetState(parsedPreset);
      }
      
      setIsDirty(false);
      setAutoSaveState(prev => ({ ...prev, conflictDetected: false }));
      
      // Re-validate after sync
      setTimeout(() => validateAll(), 0);
      
      console.log('📋 [FORM-WITH-PRESETS] Force sync completed');
    } catch (error) {
      console.error('📋 [FORM-WITH-PRESETS] Force sync failed:', error);
      throw error;
    }
  }, [storageKey, presetStorageKey, validateAll]);

  // Conflict resolution
  const resolveConflict = useCallback(async (strategy: 'local' | 'remote' | 'merge') => {
    console.log('📋 [FORM-WITH-PRESETS] Resolving conflict with strategy:', strategy);
    
    try {
      const stored = localStorage.getItem(storageKey);
      const presetStored = localStorage.getItem(presetStorageKey);
      
      if (!stored) return;
      
      const remoteData = JSON.parse(stored);
      const remotePresetData = presetStored ? JSON.parse(presetStored) : createInitialPresetState();
      
      switch (strategy) {
        case 'local':
          // Keep local data, overwrite remote
          await save();
          break;
          
        case 'remote':
          // Use remote data, discard local changes
          setShipmentDetails(remoteData);
          setPresetState(remotePresetData);
          setIsDirty(false);
          break;
          
        case 'merge':
          // Merge non-conflicting fields (simplified merge strategy)
          const merged = { ...remoteData, ...shipmentDetailsRef.current };
          setShipmentDetails(merged);
          setPresetState(remotePresetData);
          setIsDirty(true);
          break;
      }
      
      setAutoSaveState(prev => ({ ...prev, conflictDetected: false }));
      console.log('📋 [FORM-WITH-PRESETS] Conflict resolved');
    } catch (error) {
      console.error('📋 [FORM-WITH-PRESETS] Conflict resolution failed:', error);
      throw error;
    }
  }, [storageKey, presetStorageKey, save]);

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

  // Enhanced validation trigger
  useEffect(() => {
    console.log('📋 [FORM-WITH-PRESETS] Shipment details changed, triggering validation');
    
    const validateTimeout = setTimeout(() => {
      validateAll();
    }, 300);

    return () => clearTimeout(validateTimeout);
  }, [shipmentDetails, validateAll]);

  // Initial validation
  useEffect(() => {
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

  console.log('📋 [FORM-WITH-PRESETS] Returning enhanced form state and actions');

  return {
    shipmentDetails,
    validation,
    autoSave: autoSaveState,
    progress,
    presetState,
    updateOrigin,
    updateDestination,
    updatePackage,
    updateDeliveryPreferences,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateAll,
    applyPreset,
    clearPreset,
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