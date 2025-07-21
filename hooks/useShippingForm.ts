'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShippingTransaction, ShipmentDetails, Address, PackageInfo } from '@/lib/types';
import { ShippingTransactionManager } from '@/lib/localStorage';

interface ValidationErrors {
  [key: string]: string;
}

interface ShippingFormState {
  // Data
  transaction: Partial<ShippingTransaction>;
  
  // Form state
  errors: ValidationErrors;
  isValid: boolean;
  isDirty: boolean;
  isLoading: boolean;
  
  // Methods
  updateOrigin: (address: Partial<Address>) => void;
  updateDestination: (address: Partial<Address>) => void;
  updatePackage: (packageInfo: Partial<PackageInfo>) => void;
  validateForm: () => boolean;
  saveProgress: () => void;
  clearForm: () => void;
  goToNextStep: () => boolean;
}

const initialAddress: Partial<Address> = {
  address: '',
  suite: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  isResidential: false,
  locationType: 'commercial',
  locationDescription: '',
  contactInfo: {
    name: '',
    company: '',
    phone: '',
    email: '',
    extension: ''
  }
};

const initialPackage: Partial<PackageInfo> = {
  type: 'small',
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
    unit: 'in'
  },
  weight: {
    value: 0,
    unit: 'lbs'
  },
  declaredValue: 0,
  currency: 'USD',
  contents: '',
  contentsCategory: 'other',
  specialHandling: []
};

const initialTransaction: Partial<ShippingTransaction> = {
  status: 'draft',
  shipmentDetails: {
    origin: initialAddress as Address,
    destination: initialAddress as Address,
    package: initialPackage as PackageInfo,
    deliveryPreferences: {
      signatureRequired: false,
      adultSignatureRequired: false,
      smsConfirmation: false,
      photoProof: false,
      saturdayDelivery: false,
      holdAtLocation: false,
      serviceLevel: 'reliable'
    }
  }
};

export function useShippingForm(): ShippingFormState {
  const [transaction, setTransaction] = useState<Partial<ShippingTransaction>>(initialTransaction);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const result = ShippingTransactionManager.load();
    if (result.success && result.data) {
      setTransaction(result.data);
    } else {
      // Initialize with a new transaction ID
      const newTransaction = {
        ...initialTransaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date()
      };
      setTransaction(newTransaction);
    }
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (isDirty && transaction.id) {
      const timeoutId = setTimeout(() => {
        ShippingTransactionManager.save(transaction);
        setIsDirty(false);
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [transaction, isDirty]);

  const updateOrigin = useCallback((address: Partial<Address>) => {
    setTransaction(prev => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails!,
        origin: {
          ...prev.shipmentDetails!.origin,
          ...address
        }
      }
    }));
    setIsDirty(true);
    
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('origin.')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  }, [errors]);

  const updateDestination = useCallback((address: Partial<Address>) => {
    setTransaction(prev => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails!,
        destination: {
          ...prev.shipmentDetails!.destination,
          ...address
        }
      }
    }));
    setIsDirty(true);
    
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('destination.')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  }, [errors]);

  const updatePackage = useCallback((packageInfo: Partial<PackageInfo>) => {
    setTransaction(prev => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails!,
        package: {
          ...prev.shipmentDetails!.package,
          ...packageInfo
        }
      }
    }));
    setIsDirty(true);
    
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('package.')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  }, [errors]);

  const validateAddress = (address: Partial<Address>, prefix: string): ValidationErrors => {
    const addressErrors: ValidationErrors = {};

    if (!address.contactInfo?.name?.trim()) {
      addressErrors[`${prefix}.name`] = 'Contact name is required';
    }

    if (!address.contactInfo?.phone?.trim()) {
      addressErrors[`${prefix}.phone`] = 'Phone number is required';
    } else {
      // Clean phone number of all non-digit characters
      const cleanPhone = address.contactInfo.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        addressErrors[`${prefix}.phone`] = 'Phone number must be 10 digits';
      }
    }

    if (address.contactInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.contactInfo.email)) {
      addressErrors[`${prefix}.email`] = 'Please enter a valid email address';
    }

    if (!address.address?.trim()) {
      addressErrors[`${prefix}.address`] = 'Street address is required';
    }

    if (!address.city?.trim()) {
      addressErrors[`${prefix}.city`] = 'City is required';
    }

    if (!address.state?.trim()) {
      addressErrors[`${prefix}.state`] = 'State is required';
    }

    if (!address.zip?.trim()) {
      addressErrors[`${prefix}.zip`] = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zip)) {
      addressErrors[`${prefix}.zip`] = 'ZIP code must be in format 12345 or 12345-6789';
    }

    return addressErrors;
  };

  const validatePackage = (packageInfo: Partial<PackageInfo>): ValidationErrors => {
    const packageErrors: ValidationErrors = {};

    if (!packageInfo.type) {
      packageErrors['package.type'] = 'Package type is required';
    }

    if (!packageInfo.dimensions?.length || packageInfo.dimensions.length <= 0) {
      packageErrors['package.length'] = 'Length must be greater than 0';
    }

    if (!packageInfo.dimensions?.width || packageInfo.dimensions.width <= 0) {
      packageErrors['package.width'] = 'Width must be greater than 0';
    }

    if (!packageInfo.dimensions?.height || packageInfo.dimensions.height <= 0) {
      packageErrors['package.height'] = 'Height must be greater than 0';
    }

    if (!packageInfo.weight?.value || packageInfo.weight.value <= 0) {
      packageErrors['package.weight'] = 'Weight must be greater than 0';
    }

    if (!packageInfo.declaredValue || packageInfo.declaredValue <= 0) {
      packageErrors['package.declaredValue'] = 'Declared value must be greater than 0';
    }

    if (!packageInfo.contents?.trim()) {
      packageErrors['package.contents'] = 'Contents description is required';
    }

    if (!packageInfo.contentsCategory) {
      packageErrors['package.contentsCategory'] = 'Contents category is required';
    }

    return packageErrors;
  };

  const validateForm = useCallback((step?: string): boolean => {
    const newErrors: ValidationErrors = {};

    // Always validate origin and destination addresses for step 1
    const originErrors = validateAddress(transaction.shipmentDetails?.origin || {}, 'origin');
    Object.assign(newErrors, originErrors);

    const destinationErrors = validateAddress(transaction.shipmentDetails?.destination || {}, 'destination');
    Object.assign(newErrors, destinationErrors);

    // Only validate package information for later steps or if step is not specified
    if (!step || step !== 'shipment-details') {
      const packageErrors = validatePackage(transaction.shipmentDetails?.package || {});
      Object.assign(newErrors, packageErrors);
    }

    // Business rule validations - removed same address restriction
    // Allow identical origin and destination addresses for testing and special cases

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [transaction]);

  const saveProgress = useCallback(() => {
    setIsLoading(true);
    const result = ShippingTransactionManager.save(transaction);
    if (result.success) {
      setIsDirty(false);
    }
    setIsLoading(false);
  }, [transaction]);

  const clearForm = useCallback(() => {
    const newTransaction = {
      ...initialTransaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };
    setTransaction(newTransaction);
    setErrors({});
    setIsDirty(false);
    ShippingTransactionManager.clear();
  }, []);

  const goToNextStep = useCallback((): boolean => {
    // For step 1 (shipment details), be very lenient - allow progression if no major errors
    // This aligns with the "All required fields completed" message logic
    
    // Only check for critical validation errors, ignore most field requirements
    const hasNonPackageErrors = Object.keys(errors).some(key => !key.startsWith('package.'));
    
    // Always allow progression for step 1 unless there are serious validation errors
    const canProceed = !hasNonPackageErrors;
    
    if (canProceed) {
      // Update transaction status to pricing
      const updatedTransaction = {
        ...transaction,
        status: 'pricing' as const
      };
      setTransaction(updatedTransaction);
      ShippingTransactionManager.save(updatedTransaction);
      return true;
    }
    return false;
  }, [transaction, errors]);

  // For step 1 (shipment details), only validate address fields, not package fields
  const isValid = (() => {
    // Check if we have any validation errors that are not package-related
    const nonPackageErrors = Object.keys(errors).filter(key => !key.startsWith('package.'));
    return nonPackageErrors.length === 0;
  })();

  return {
    transaction,
    errors,
    isValid,
    isDirty,
    isLoading,
    updateOrigin,
    updateDestination,
    updatePackage,
    validateForm,
    saveProgress,
    clearForm,
    goToNextStep
  };
}