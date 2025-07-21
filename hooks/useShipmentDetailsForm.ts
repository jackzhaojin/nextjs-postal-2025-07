'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Address, ShipmentDetails, ContactInfo } from '@/lib/types';
import { AddressValidator } from '@/lib/validation/addressValidation';

interface FormValidationState {
  errors: Record<string, string>;
  warnings: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
}

interface UseShipmentDetailsFormOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseShipmentDetailsFormReturn {
  // Form data
  shipmentDetails: ShipmentDetails;
  
  // Validation state
  validation: FormValidationState;
  
  // Form actions
  updateOrigin: (address: Address) => void;
  updateDestination: (address: Address) => void;
  updatePackage: (packageInfo: any) => void;
  updateDeliveryPreferences: (preferences: any) => void;
  
  // Field-level actions
  setFieldTouched: (field: string) => void;
  validateField: (field: string) => void;
  validateAll: () => boolean;
  
  // Form state
  isDirty: boolean;
  isLoading: boolean;
  
  // Actions
  save: () => Promise<void>;
  reset: () => void;
  
  // Progress tracking
  completionProgress: number;
  requiredFieldsComplete: boolean;
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
  country: 'USA',
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
): UseShipmentDetailsFormReturn {
  
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  console.log('useShipmentDetailsForm: Initializing with options:', options);
  console.log('useShipmentDetailsForm: Initial data:', initialData);

  // Form state
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>(() => ({
    ...defaultShipmentDetails,
    ...initialData
  }));

  const [validation, setValidation] = useState<FormValidationState>({
    errors: {},
    warnings: {},
    touched: {},
    isValid: false
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for managing auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialDataRef = useRef(initialData);

  console.log('useShipmentDetailsForm: Current state - isDirty:', isDirty, 'isValid:', validation.isValid);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (!autoSave || !isDirty) return;

    console.log('useShipmentDetailsForm: Triggering auto-save');
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        console.log('useShipmentDetailsForm: Auto-saving data...');
        
        // Save to localStorage (in production, this would be an API call)
        localStorage.setItem('currentShipmentDetails', JSON.stringify(shipmentDetails));
        setIsDirty(false);
        
        console.log('useShipmentDetailsForm: Auto-save completed');
      } catch (error) {
        console.error('useShipmentDetailsForm: Auto-save failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay, isDirty, shipmentDetails]);

  // Validation functions
  const validateField = useCallback((field: string) => {
    console.log('useShipmentDetailsForm: Validating field:', field);
    
    const newErrors = { ...validation.errors };
    const newWarnings = { ...validation.warnings };

    // Address validation
    if (field.startsWith('origin')) {
      const originValidation = AddressValidator.validateAddress(shipmentDetails.origin);
      
      Object.entries(originValidation.errors).forEach(([key, error]) => {
        newErrors[`origin.${key}`] = error;
      });
      
      Object.entries(originValidation.warnings).forEach(([key, warning]) => {
        newWarnings[`origin.${key}`] = warning;
      });

      // Contact info validation
      const contactValidation = AddressValidator.validateContactInfo(shipmentDetails.origin.contactInfo);
      Object.entries(contactValidation.errors).forEach(([key, error]) => {
        newErrors[`origin.${key}`] = error;
      });
    }

    if (field.startsWith('destination')) {
      const destValidation = AddressValidator.validateAddress(shipmentDetails.destination);
      
      Object.entries(destValidation.errors).forEach(([key, error]) => {
        newErrors[`destination.${key}`] = error;
      });
      
      Object.entries(destValidation.warnings).forEach(([key, warning]) => {
        newWarnings[`destination.${key}`] = warning;
      });

      // Contact info validation  
      const contactValidation = AddressValidator.validateContactInfo(shipmentDetails.destination.contactInfo);
      Object.entries(contactValidation.errors).forEach(([key, error]) => {
        newErrors[`destination.${key}`] = error;
      });
    }

    // Cross-field validation: addresses must be different
    if ((field.startsWith('origin') || field.startsWith('destination')) && 
        shipmentDetails.origin.address && shipmentDetails.destination.address) {
      const differentValidation = AddressValidator.validateAddressesDifferent(
        shipmentDetails.origin, 
        shipmentDetails.destination
      );
      
      if (!differentValidation.isValid) {
        newErrors['addresses.different'] = differentValidation.error || 'Addresses must be different';
      } else {
        delete newErrors['addresses.different'];
      }
    }

    // Remove errors for this field if no longer applicable
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(field) && !newErrors[key]) {
        delete newErrors[key];
      }
    });

    const isValid = Object.keys(newErrors).length === 0;

    setValidation(prev => ({
      ...prev,
      errors: newErrors,
      warnings: newWarnings,
      isValid
    }));

    console.log('useShipmentDetailsForm: Field validation result:', { field, errors: newErrors, isValid });
  }, [shipmentDetails, validation.errors, validation.warnings]);

  const validateAll = useCallback(() => {
    console.log('useShipmentDetailsForm: Validating all fields');

    // Validate origin
    const originValidation = AddressValidator.validateAddress(shipmentDetails.origin);
    const originContactValidation = AddressValidator.validateContactInfo(shipmentDetails.origin.contactInfo);
    
    // Validate destination
    const destValidation = AddressValidator.validateAddress(shipmentDetails.destination);
    const destContactValidation = AddressValidator.validateContactInfo(shipmentDetails.destination.contactInfo);
    
    // Validate addresses are different
    const differentValidation = AddressValidator.validateAddressesDifferent(
      shipmentDetails.origin, 
      shipmentDetails.destination
    );

    // Combine all errors
    const allErrors = {
      ...Object.fromEntries(Object.entries(originValidation.errors).map(([k, v]) => [`origin.${k}`, v])),
      ...Object.fromEntries(Object.entries(originContactValidation.errors).map(([k, v]) => [`origin.${k}`, v])),
      ...Object.fromEntries(Object.entries(destValidation.errors).map(([k, v]) => [`destination.${k}`, v])),
      ...Object.fromEntries(Object.entries(destContactValidation.errors).map(([k, v]) => [`destination.${k}`, v])),
    };

    if (!differentValidation.isValid) {
      allErrors['addresses.different'] = differentValidation.error || 'Addresses must be different';
    }

    // Combine all warnings
    const allWarnings = {
      ...Object.fromEntries(Object.entries(originValidation.warnings).map(([k, v]) => [`origin.${k}`, v])),
      ...Object.fromEntries(Object.entries(destValidation.warnings).map(([k, v]) => [`destination.${k}`, v])),
    };

    const isValid = Object.keys(allErrors).length === 0;

    setValidation({
      errors: allErrors,
      warnings: allWarnings,
      touched: validation.touched,
      isValid
    });

    console.log('useShipmentDetailsForm: Complete validation result:', { 
      isValid, 
      errorCount: Object.keys(allErrors).length,
      warningCount: Object.keys(allWarnings).length 
    });

    return isValid;
  }, [shipmentDetails, validation.touched]);

  // Form update functions
  const updateOrigin = useCallback((address: Address) => {
    console.log('useShipmentDetailsForm: Updating origin address:', address);
    
    setShipmentDetails(prev => ({
      ...prev,
      origin: address
    }));
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateField('origin');
    }
  }, [validateOnChange, validateField]);

  const updateDestination = useCallback((address: Address) => {
    console.log('useShipmentDetailsForm: Updating destination address:', address);
    
    setShipmentDetails(prev => ({
      ...prev,
      destination: address
    }));
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateField('destination');
    }
  }, [validateOnChange, validateField]);

  const updatePackage = useCallback((packageInfo: any) => {
    console.log('useShipmentDetailsForm: Updating package info:', packageInfo);
    
    setShipmentDetails(prev => ({
      ...prev,
      package: {
        ...prev.package,
        ...packageInfo
      }
    }));
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateField('package');
    }
  }, [validateOnChange, validateField]);

  const updateDeliveryPreferences = useCallback((preferences: any) => {
    console.log('useShipmentDetailsForm: Updating delivery preferences:', preferences);
    
    setShipmentDetails(prev => ({
      ...prev,
      deliveryPreferences: {
        ...prev.deliveryPreferences,
        ...preferences
      }
    }));
    
    setIsDirty(true);
  }, []);

  // Field touched tracking
  const setFieldTouched = useCallback((field: string) => {
    console.log('useShipmentDetailsForm: Setting field touched:', field);
    
    setValidation(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true
      }
    }));

    if (validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  // Manual save function
  const save = useCallback(async () => {
    console.log('useShipmentDetailsForm: Manual save triggered');
    setIsLoading(true);
    
    try {
      // Validate before saving
      const isValid = validateAll();
      
      if (!isValid) {
        console.warn('useShipmentDetailsForm: Cannot save - validation failed');
        throw new Error('Form validation failed');
      }

      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('currentShipmentDetails', JSON.stringify(shipmentDetails));
      setIsDirty(false);
      
      console.log('useShipmentDetailsForm: Manual save completed');
    } catch (error) {
      console.error('useShipmentDetailsForm: Manual save failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shipmentDetails, validateAll]);

  // Reset function
  const reset = useCallback(() => {
    console.log('useShipmentDetailsForm: Resetting form');
    
    setShipmentDetails({ ...defaultShipmentDetails, ...initialDataRef.current });
    setValidation({
      errors: {},
      warnings: {},
      touched: {},
      isValid: false
    });
    setIsDirty(false);
    
    // Clear auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  // Calculate completion progress
  const completionProgress = useCallback(() => {
    const requiredFields = [
      'origin.address', 'origin.city', 'origin.state', 'origin.zip', 'origin.country',
      'origin.contactInfo.name', 'origin.contactInfo.phone', 'origin.contactInfo.email',
      'destination.address', 'destination.city', 'destination.state', 'destination.zip', 'destination.country',
      'destination.contactInfo.name', 'destination.contactInfo.phone', 'destination.contactInfo.email'
    ];

    const completedFields = requiredFields.filter(field => {
      const fieldParts = field.split('.');
      let value = shipmentDetails as any;
      
      for (const part of fieldParts) {
        value = value?.[part];
      }
      
      return value && String(value).trim() !== '';
    });

    const progress = (completedFields.length / requiredFields.length) * 100;
    console.log('useShipmentDetailsForm: Completion progress:', progress, '%');
    
    return Math.round(progress);
  }, [shipmentDetails]);

  const requiredFieldsComplete = completionProgress() === 100;

  // Auto-save effect
  useEffect(() => {
    if (isDirty) {
      triggerAutoSave();
    }
  }, [isDirty, triggerAutoSave]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    shipmentDetails,
    validation,
    updateOrigin,
    updateDestination,
    updatePackage,
    updateDeliveryPreferences,
    setFieldTouched,
    validateField,
    validateAll,
    isDirty,
    isLoading,
    save,
    reset,
    completionProgress: completionProgress(),
    requiredFieldsComplete
  };
}