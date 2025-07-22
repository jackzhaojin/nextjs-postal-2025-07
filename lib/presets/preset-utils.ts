// Utility functions for shipping preset management
// Task 5.3: Preset system utilities

import { ShippingTransaction, ShipmentDetails } from '@/lib/types';
import { ShippingPreset, PresetSelectionState } from './shipping-presets';

console.log('🔧 [PRESET-UTILS] Loading preset utilities...');

/**
 * Deep merge preset data with existing transaction data
 */
export function mergePresetWithTransaction(
  preset: ShippingPreset,
  existingTransaction?: Partial<ShippingTransaction>
): ShippingTransaction {
  console.log('🔧 [PRESET-UTILS] Merging preset with transaction:', {
    presetId: preset.id,
    presetName: preset.name,
    hasExisting: !!existingTransaction
  });

  const baseTransaction: ShippingTransaction = {
    id: existingTransaction?.id || generateTransactionId(),
    timestamp: new Date(),
    status: existingTransaction?.status || 'draft',
    shipmentDetails: preset.shipmentDetails,
    selectedOption: existingTransaction?.selectedOption,
    paymentInfo: existingTransaction?.paymentInfo,
    pickupDetails: existingTransaction?.pickupDetails,
    confirmationNumber: existingTransaction?.confirmationNumber
  };

  console.log('🔧 [PRESET-UTILS] Created merged transaction:', {
    id: baseTransaction.id,
    status: baseTransaction.status,
    hasOrigin: !!baseTransaction.shipmentDetails.origin,
    hasDestination: !!baseTransaction.shipmentDetails.destination,
    packageType: baseTransaction.shipmentDetails.package?.type
  });

  return baseTransaction;
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const id = `txn_${timestamp}_${random}`;
  console.log('🔧 [PRESET-UTILS] Generated transaction ID:', id);
  return id;
}

/**
 * Detect which fields have been modified from the original preset
 */
export function detectModifiedFields(
  currentData: ShipmentDetails,
  presetData: ShipmentDetails
): string[] {
  console.log('🔧 [PRESET-UTILS] Detecting modified fields...');
  
  const modifiedFields: string[] = [];

  // Helper function to compare values deeply
  function compareValues(current: any, preset: any, path: string): void {
    if (current === preset) return;

    if (typeof current === 'object' && typeof preset === 'object' && current !== null && preset !== null) {
      // Both are objects, compare recursively
      const allKeys = new Set([...Object.keys(current), ...Object.keys(preset)]);
      
      for (const key of allKeys) {
        compareValues(current[key], preset[key], path ? `${path}.${key}` : key);
      }
    } else {
      // Values are different, add to modified fields
      if (current !== preset) {
        modifiedFields.push(path);
      }
    }
  }

  compareValues(currentData, presetData, '');

  console.log('🔧 [PRESET-UTILS] Modified fields detected:', modifiedFields.length, modifiedFields);
  return modifiedFields;
}

/**
 * Calculate completion percentage for preset application
 */
export function calculatePresetCompletionPercentage(
  currentData: ShipmentDetails,
  preset: ShippingPreset
): number {
  console.log('🔧 [PRESET-UTILS] Calculating preset completion percentage...');

  const requiredFields = [
    'origin.address',
    'origin.city',
    'origin.state',
    'origin.zip',
    'origin.contactInfo.name',
    'origin.contactInfo.phone',
    'destination.address',
    'destination.city',
    'destination.state',
    'destination.zip',
    'destination.contactInfo.name',
    'destination.contactInfo.phone',
    'package.type',
    'package.weight.value',
    'package.dimensions.length',
    'package.dimensions.width',
    'package.dimensions.height',
    'package.declaredValue'
  ];

  let filledFields = 0;

  for (const fieldPath of requiredFields) {
    const value = getNestedValue(currentData, fieldPath);
    if (value !== undefined && value !== null && value !== '' && value !== 0) {
      filledFields++;
    }
  }

  const percentage = Math.round((filledFields / requiredFields.length) * 100);
  
  console.log('🔧 [PRESET-UTILS] Completion calculated:', {
    filledFields,
    totalFields: requiredFields.length,
    percentage
  });

  return percentage;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Validate preset data integrity
 */
export function validatePresetData(preset: ShippingPreset): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  console.log('🔧 [PRESET-UTILS] Validating preset data:', preset.name);

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required preset fields
  if (!preset.id) errors.push('Missing preset ID');
  if (!preset.name) errors.push('Missing preset name');
  if (!preset.description) errors.push('Missing preset description');
  if (!preset.category) errors.push('Missing preset category');

  // Validate shipment details
  const { shipmentDetails } = preset;
  
  if (!shipmentDetails) {
    errors.push('Missing shipment details');
  } else {
    // Validate origin
    if (!shipmentDetails.origin) {
      errors.push('Missing origin address');
    } else {
      if (!shipmentDetails.origin.address) errors.push('Missing origin address');
      if (!shipmentDetails.origin.city) errors.push('Missing origin city');
      if (!shipmentDetails.origin.state) errors.push('Missing origin state');
      if (!shipmentDetails.origin.zip) errors.push('Missing origin zip');
      if (!shipmentDetails.origin.contactInfo?.name) errors.push('Missing origin contact name');
      if (!shipmentDetails.origin.contactInfo?.phone) errors.push('Missing origin contact phone');
    }

    // Validate destination
    if (!shipmentDetails.destination) {
      errors.push('Missing destination address');
    } else {
      if (!shipmentDetails.destination.address) errors.push('Missing destination address');
      if (!shipmentDetails.destination.city) errors.push('Missing destination city');
      if (!shipmentDetails.destination.state) errors.push('Missing destination state');
      if (!shipmentDetails.destination.zip) errors.push('Missing destination zip');
      if (!shipmentDetails.destination.contactInfo?.name) errors.push('Missing destination contact name');
      if (!shipmentDetails.destination.contactInfo?.phone) errors.push('Missing destination contact phone');
    }

    // Validate package
    if (!shipmentDetails.package) {
      errors.push('Missing package information');
    } else {
      if (!shipmentDetails.package.type) errors.push('Missing package type');
      if (!shipmentDetails.package.weight?.value || shipmentDetails.package.weight.value <= 0) {
        errors.push('Invalid package weight');
      }
      if (!shipmentDetails.package.dimensions?.length || shipmentDetails.package.dimensions.length <= 0) {
        errors.push('Invalid package dimensions');
      }
      if (!shipmentDetails.package.declaredValue || shipmentDetails.package.declaredValue <= 0) {
        errors.push('Invalid declared value');
      }
      if (!shipmentDetails.package.contents) warnings.push('Missing package contents description');
      if (!shipmentDetails.package.contentsCategory) warnings.push('Missing contents category');
    }
  }

  // Validate estimated savings
  if (preset.estimatedSavings && (preset.estimatedSavings < 0 || preset.estimatedSavings > 100)) {
    warnings.push('Invalid estimated savings percentage');
  }

  const isValid = errors.length === 0;

  console.log('🔧 [PRESET-UTILS] Preset validation result:', {
    presetName: preset.name,
    isValid,
    errorCount: errors.length,
    warningCount: warnings.length
  });

  return { isValid, errors, warnings };
}

/**
 * Create initial preset selection state
 */
export function createInitialPresetState(): PresetSelectionState {
  console.log('🔧 [PRESET-UTILS] Creating initial preset state');
  
  return {
    selectedPresetId: undefined,
    isModified: false,
    modifiedFields: []
  };
}

/**
 * Update preset selection state with new data
 */
export function updatePresetState(
  currentState: PresetSelectionState,
  updates: Partial<PresetSelectionState>
): PresetSelectionState {
  console.log('🔧 [PRESET-UTILS] Updating preset state:', {
    current: currentState,
    updates
  });

  const newState = {
    ...currentState,
    ...updates
  };

  console.log('🔧 [PRESET-UTILS] New preset state:', newState);
  return newState;
}

/**
 * Reset preset state to initial values
 */
export function resetPresetState(): PresetSelectionState {
  console.log('🔧 [PRESET-UTILS] Resetting preset state');
  return createInitialPresetState();
}

/**
 * Get field modification status for UI feedback
 */
export function getFieldModificationStatus(
  fieldPath: string,
  modifiedFields: string[]
): 'original' | 'modified' {
  const isModified = modifiedFields.some(modifiedField => 
    modifiedField === fieldPath || fieldPath.startsWith(modifiedField + '.')
  );
  
  return isModified ? 'modified' : 'original';
}

console.log('🔧 [PRESET-UTILS] Preset utilities loaded successfully');