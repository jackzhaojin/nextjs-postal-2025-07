// Advanced validation framework for shipment details
// Implements comprehensive validation with business rules and cross-field validation

import { ShipmentDetails, Address, PackageInfo, ContactInfo, DeliveryPreferences } from '@/lib/types';
import { AddressValidator } from './addressValidation';

export interface ValidationRule<T> {
  validator: (value: T, context?: any) => boolean;
  message: string;
  severity: 'error' | 'warning';
  dependencies?: string[];
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<any>[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  fieldValidation: Record<string, boolean>;
}

export interface CrossFieldValidationRule {
  fields: string[];
  validator: (values: Record<string, any>) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

export class ShipmentValidator {
  
  static readonly VALIDATION_SCHEMA: ValidationSchema<ShipmentDetails> = {
    'origin.address': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Origin address is required',
        severity: 'error'
      },
      {
        validator: (value: string) => value?.trim().length >= 5,
        message: 'Address must be at least 5 characters',
        severity: 'error'
      }
    ],
    'origin.city': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Origin city is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^[a-zA-Z\s\-'\.]+$/.test(value || ''),
        message: 'City contains invalid characters',
        severity: 'warning'
      }
    ],
    'origin.state': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Origin state is required',
        severity: 'error'
      }
    ],
    'origin.zip': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Origin ZIP code is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^\d{5}(-\d{4})?$/.test(value || ''),
        message: 'Invalid ZIP code format (use 12345 or 12345-6789)',
        severity: 'error'
      }
    ],
    'origin.contactInfo.name': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Contact name is required',
        severity: 'error'
      },
      {
        validator: (value: string) => (value?.trim().length || 0) >= 2,
        message: 'Contact name must be at least 2 characters',
        severity: 'error'
      }
    ],
    'origin.contactInfo.phone': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Contact phone is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^\+?[\d\s\-\(\)\.]{10,}$/.test(value || ''),
        message: 'Invalid phone number format',
        severity: 'error'
      }
    ],
    'origin.contactInfo.email': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Contact email is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ''),
        message: 'Invalid email format',
        severity: 'error'
      }
    ],
    'destination.address': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Destination address is required',
        severity: 'error'
      },
      {
        validator: (value: string) => value?.trim().length >= 5,
        message: 'Address must be at least 5 characters',
        severity: 'error'
      }
    ],
    'destination.city': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Destination city is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^[a-zA-Z\s\-'\.]+$/.test(value || ''),
        message: 'City contains invalid characters',
        severity: 'warning'
      }
    ],
    'destination.state': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Destination state is required',
        severity: 'error'
      }
    ],
    'destination.zip': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Destination ZIP code is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^\d{5}(-\d{4})?$/.test(value || ''),
        message: 'Invalid ZIP code format (use 12345 or 12345-6789)',
        severity: 'error'
      }
    ],
    'destination.contactInfo.name': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Contact name is required',
        severity: 'error'
      },
      {
        validator: (value: string) => (value?.trim().length || 0) >= 2,
        message: 'Contact name must be at least 2 characters',
        severity: 'error'
      }
    ],
    'destination.contactInfo.phone': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Contact phone is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^\+?[\d\s\-\(\)\.]{10,}$/.test(value || ''),
        message: 'Invalid phone number format',
        severity: 'error'
      }
    ],
    'destination.contactInfo.email': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Contact email is required',
        severity: 'error'
      },
      {
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ''),
        message: 'Invalid email format',
        severity: 'error'
      }
    ],
    'package.weight.value': [
      {
        validator: (value: number) => value > 0,
        message: 'Package weight must be greater than 0',
        severity: 'error'
      },
      {
        validator: (value: number) => value <= 2500,
        message: 'Package weight exceeds maximum limit of 2500 lbs',
        severity: 'error'
      }
    ],
    'package.dimensions.length': [
      {
        validator: (value: number) => value > 0,
        message: 'Length must be greater than 0',
        severity: 'error'
      },
      {
        validator: (value: number) => value <= 120,
        message: 'Length exceeds maximum limit of 120 inches',
        severity: 'error'
      }
    ],
    'package.dimensions.width': [
      {
        validator: (value: number) => value > 0,
        message: 'Width must be greater than 0',
        severity: 'error'
      },
      {
        validator: (value: number) => value <= 120,
        message: 'Width exceeds maximum limit of 120 inches',
        severity: 'error'
      }
    ],
    'package.dimensions.height': [
      {
        validator: (value: number) => value > 0,
        message: 'Height must be greater than 0',
        severity: 'error'
      },
      {
        validator: (value: number) => value <= 120,
        message: 'Height exceeds maximum limit of 120 inches',
        severity: 'error'
      }
    ],
    'package.declaredValue': [
      {
        validator: (value: number) => value > 0,
        message: 'Declared value must be greater than 0',
        severity: 'error'
      },
      {
        validator: (value: number) => value <= 100000,
        message: 'Declared value exceeds maximum limit of $100,000',
        severity: 'error'
      }
    ],
    'package.contents': [
      {
        validator: (value: string) => !!value?.trim(),
        message: 'Package contents description is required',
        severity: 'error'
      },
      {
        validator: (value: string) => (value?.trim().length || 0) >= 3,
        message: 'Contents description must be at least 3 characters',
        severity: 'error'
      }
    ]
  };

  static readonly CROSS_FIELD_RULES: CrossFieldValidationRule[] = [
    {
      fields: ['origin.address', 'destination.address'],
      validator: (values) => {
        const originAddress = values['origin.address'];
        const destAddress = values['destination.address'];
        return originAddress !== destAddress || !originAddress || !destAddress;
      },
      message: 'Origin and destination addresses cannot be the same',
      severity: 'error'
    },
    {
      fields: ['origin.zip', 'destination.zip'],
      validator: (values) => {
        const originZip = values['origin.zip'];
        const destZip = values['destination.zip'];
        return originZip !== destZip || !originZip || !destZip;
      },
      message: 'Origin and destination ZIP codes cannot be the same',
      severity: 'error'
    },
    {
      fields: ['package.weight.value', 'package.type'],
      validator: (values) => {
        const weight = values['package.weight.value'];
        const type = values['package.type'];
        
        const limits: Record<string, number> = {
          'envelope': 1,
          'small': 10,
          'medium': 50,
          'large': 150,
          'pallet': 2500
        };
        
        return !weight || !type || weight <= (limits[type] || 2500);
      },
      message: 'Package weight exceeds limits for selected package type',
      severity: 'error'
    },
    {
      fields: ['package.declaredValue', 'package.weight.value'],
      validator: (values) => {
        const declaredValue = values['package.declaredValue'];
        const weight = values['package.weight.value'];
        
        // Warn if declared value seems unreasonable compared to weight
        if (!declaredValue || !weight) return true;
        
        const valuePerPound = declaredValue / weight;
        return valuePerPound <= 1000; // Max $1000 per pound
      },
      message: 'Declared value seems unusually high for package weight',
      severity: 'warning'
    },
    {
      fields: ['package.dimensions.length', 'package.dimensions.width', 'package.dimensions.height', 'package.type'],
      validator: (values) => {
        const length = values['package.dimensions.length'];
        const width = values['package.dimensions.width'];
        const height = values['package.dimensions.height'];
        const type = values['package.type'];
        
        if (!length || !width || !height || !type) return true;
        
        const volume = length * width * height;
        const limits: Record<string, number> = {
          'envelope': 100,
          'small': 1000,
          'medium': 5000,
          'large': 15000,
          'pallet': 100000
        };
        
        return volume <= (limits[type] || 100000);
      },
      message: 'Package dimensions exceed limits for selected package type',
      severity: 'error'
    }
  ];

  /**
   * Validate shipment details with comprehensive rule checking
   */
  static validateShipmentDetails(shipmentDetails: Partial<ShipmentDetails>): ValidationResult {
    console.log('ShipmentValidator: Starting comprehensive validation');
    console.log('ShipmentValidator: Data to validate:', shipmentDetails);

    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    const fieldValidation: Record<string, boolean> = {};

    try {
      // Field-level validation
      Object.entries(this.VALIDATION_SCHEMA).forEach(([fieldPath, rules]) => {
        const value = this.getNestedValue(shipmentDetails, fieldPath);
        let fieldValid = true;

        rules.forEach(rule => {
          if (!rule.validator(value, shipmentDetails)) {
            fieldValid = false;
            if (rule.severity === 'error') {
              errors[fieldPath] = rule.message;
            } else {
              warnings[fieldPath] = rule.message;
            }
          }
        });

        fieldValidation[fieldPath] = fieldValid;
      });

      // Cross-field validation
      this.CROSS_FIELD_RULES.forEach(rule => {
        const values: Record<string, any> = {};
        rule.fields.forEach(field => {
          values[field] = this.getNestedValue(shipmentDetails, field);
        });

        if (!rule.validator(values)) {
          const fieldKey = rule.fields.join('_');
          if (rule.severity === 'error') {
            errors[fieldKey] = rule.message;
          } else {
            warnings[fieldKey] = rule.message;
          }
        }
      });

      // Business rule validation
      const businessRuleValidation = this.validateBusinessRules(shipmentDetails);
      Object.assign(errors, businessRuleValidation.errors);
      Object.assign(warnings, businessRuleValidation.warnings);

      const isValid = Object.keys(errors).length === 0;

      console.log('ShipmentValidator: Validation completed');
      console.log('ShipmentValidator: Is valid:', isValid);
      console.log('ShipmentValidator: Errors:', errors);
      console.log('ShipmentValidator: Warnings:', warnings);

      return {
        isValid,
        errors,
        warnings,
        fieldValidation
      };

    } catch (error) {
      console.error('ShipmentValidator: Validation error:', error);
      return {
        isValid: false,
        errors: { validation: 'Validation system error' },
        warnings: {},
        fieldValidation: {}
      };
    }
  }

  /**
   * Validate specific field with real-time feedback
   */
  static validateField(fieldPath: string, value: any, context?: Partial<ShipmentDetails>): ValidationResult {
    console.log('ShipmentValidator: Validating field:', fieldPath, 'with value:', value);

    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    const fieldValidation: Record<string, boolean> = {};

    const rules = this.VALIDATION_SCHEMA[fieldPath];
    if (rules) {
      let fieldValid = true;

      rules.forEach(rule => {
        if (!rule.validator(value, context)) {
          fieldValid = false;
          if (rule.severity === 'error') {
            errors[fieldPath] = rule.message;
          } else {
            warnings[fieldPath] = rule.message;
          }
        }
      });

      fieldValidation[fieldPath] = fieldValid;
    }

    // Check cross-field rules that involve this field
    if (context) {
      this.CROSS_FIELD_RULES.forEach(rule => {
        if (rule.fields.includes(fieldPath)) {
          const values: Record<string, any> = {};
          rule.fields.forEach(field => {
            values[field] = field === fieldPath ? value : this.getNestedValue(context, field);
          });

          if (!rule.validator(values)) {
            const fieldKey = rule.fields.join('_');
            if (rule.severity === 'error') {
              errors[fieldKey] = rule.message;
            } else {
              warnings[fieldKey] = rule.message;
            }
          }
        }
      });
    }

    const isValid = Object.keys(errors).length === 0;

    console.log('ShipmentValidator: Field validation result:', { isValid, errors, warnings });

    return {
      isValid,
      errors,
      warnings,
      fieldValidation
    };
  }

  /**
   * Business rules validation
   */
  private static validateBusinessRules(shipmentDetails: Partial<ShipmentDetails>): {
    errors: Record<string, string>;
    warnings: Record<string, string>;
  } {
    console.log('ShipmentValidator: Validating business rules');

    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Service availability validation (mock)
    if (shipmentDetails.origin?.zip && shipmentDetails.destination?.zip) {
      // Mock service area validation
      const restrictedZips = ['99999', '00000'];
      if (restrictedZips.includes(shipmentDetails.origin.zip)) {
        errors.serviceArea = 'Service not available in origin area';
      }
      if (restrictedZips.includes(shipmentDetails.destination.zip)) {
        errors.serviceArea = 'Service not available in destination area';
      }
    }

    // Hazmat validation
    if (shipmentDetails.package?.specialHandling?.includes('hazmat')) {
      if (!shipmentDetails.package.contents?.toLowerCase().includes('hazmat')) {
        warnings.hazmat = 'Hazmat handling selected but contents description should specify hazardous materials';
      }
    }

    // Insurance requirements
    if (shipmentDetails.package?.declaredValue && shipmentDetails.package.declaredValue > 1000) {
      if (!shipmentDetails.package.specialHandling?.includes('white-glove')) {
        warnings.insurance = 'High value packages may require additional handling options';
      }
    }

    console.log('ShipmentValidator: Business rules validation completed');

    return { errors, warnings };
  }

  /**
   * Get nested object value by dot notation path
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate form completion percentage
   */
  static calculateCompletionProgress(shipmentDetails: Partial<ShipmentDetails>): {
    percentage: number;
    completedFields: number;
    totalFields: number;
    requiredFieldsComplete: boolean;
  } {
    console.log('ShipmentValidator: Calculating completion progress');

    const requiredFields = Object.keys(this.VALIDATION_SCHEMA).filter(field => 
      this.VALIDATION_SCHEMA[field].some(rule => rule.severity === 'error')
    );

    let completedFields = 0;
    let requiredFieldsCompleted = 0;

    requiredFields.forEach(fieldPath => {
      const value = this.getNestedValue(shipmentDetails, fieldPath);
      const isComplete = this.isFieldComplete(fieldPath, value);
      
      if (isComplete) {
        completedFields++;
        const isRequired = this.VALIDATION_SCHEMA[fieldPath].some(rule => rule.severity === 'error');
        if (isRequired) {
          requiredFieldsCompleted++;
        }
      }
    });

    const totalFields = requiredFields.length;
    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    const requiredFieldsComplete = requiredFieldsCompleted === requiredFields.length;

    console.log('ShipmentValidator: Progress calculation:', {
      percentage,
      completedFields,
      totalFields,
      requiredFieldsComplete
    });

    return {
      percentage,
      completedFields,
      totalFields,
      requiredFieldsComplete
    };
  }

  /**
   * Check if a field is complete based on its value
   */
  private static isFieldComplete(fieldPath: string, value: any): boolean {
    const rules = this.VALIDATION_SCHEMA[fieldPath];
    if (!rules) return true;

    return rules.every(rule => {
      if (rule.severity === 'error') {
        return rule.validator(value);
      }
      return true; // Warnings don't affect completion
    });
  }
}
