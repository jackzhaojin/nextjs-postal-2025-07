'use client';

import { useMemo } from 'react';
import { ConfirmationPageData, ShippingTransaction } from '@/lib/types';

interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface UseConfirmationValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
  completenessScore: number;
  missingFields: string[];
}

export function useConfirmationValidation(
  confirmationData: ConfirmationPageData | null
): UseConfirmationValidationResult {
  
  const validationResult = useMemo(() => {
    console.log('useConfirmationValidation - Validating confirmation data:', confirmationData);
    
    const issues: ValidationIssue[] = [];
    const missingFields: string[] = [];
    
    if (!confirmationData) {
      issues.push({
        field: 'general',
        message: 'No confirmation data available',
        severity: 'error'
      });
      
      return {
        isValid: false,
        issues,
        hasErrors: true,
        hasWarnings: false,
        completenessScore: 0,
        missingFields: ['confirmation_data']
      };
    }

    // Validate confirmation number
    if (!confirmationData.confirmationNumber) {
      issues.push({
        field: 'confirmationNumber',
        message: 'Confirmation number is missing',
        severity: 'error'
      });
      missingFields.push('confirmation_number');
    } else if (!/^SHP-\d{4}-[A-Z0-9]{6}$/.test(confirmationData.confirmationNumber)) {
      issues.push({
        field: 'confirmationNumber',
        message: 'Confirmation number format is invalid',
        severity: 'warning'
      });
    }

    // Validate transaction data
    if (!confirmationData.transaction) {
      issues.push({
        field: 'transaction',
        message: 'Transaction data is missing',
        severity: 'error'
      });
      missingFields.push('transaction_data');
    } else {
      // Validate shipment details
      if (!confirmationData.transaction.shipmentDetails) {
        issues.push({
          field: 'shipmentDetails',
          message: 'Shipment details are missing',
          severity: 'error'
        });
        missingFields.push('shipment_details');
      } else {
        const { shipmentDetails } = confirmationData.transaction;
        
        // Validate origin
        if (!shipmentDetails.origin) {
          issues.push({
            field: 'origin',
            message: 'Origin address is missing',
            severity: 'error'
          });
          missingFields.push('origin_address');
        } else {
          if (!shipmentDetails.origin.address) {
            issues.push({
              field: 'origin.address',
              message: 'Origin street address is missing',
              severity: 'error'
            });
            missingFields.push('origin_street_address');
          }
          
          if (!shipmentDetails.origin.contactInfo?.name) {
            issues.push({
              field: 'origin.contact',
              message: 'Origin contact name is missing',
              severity: 'warning'
            });
            missingFields.push('origin_contact_name');
          }
        }

        // Validate destination
        if (!shipmentDetails.destination) {
          issues.push({
            field: 'destination',
            message: 'Destination address is missing',
            severity: 'error'
          });
          missingFields.push('destination_address');
        } else {
          if (!shipmentDetails.destination.address) {
            issues.push({
              field: 'destination.address',
              message: 'Destination street address is missing',
              severity: 'error'
            });
            missingFields.push('destination_street_address');
          }
          
          if (!shipmentDetails.destination.contactInfo?.name) {
            issues.push({
              field: 'destination.contact',
              message: 'Destination contact name is missing',
              severity: 'warning'
            });
            missingFields.push('destination_contact_name');
          }
        }

        // Validate package info
        if (!shipmentDetails.package) {
          issues.push({
            field: 'package',
            message: 'Package information is missing',
            severity: 'error'
          });
          missingFields.push('package_info');
        } else {
          if (!shipmentDetails.package.weight?.value || shipmentDetails.package.weight.value <= 0) {
            issues.push({
              field: 'package.weight',
              message: 'Package weight is missing or invalid',
              severity: 'error'
            });
            missingFields.push('package_weight');
          }
          
          if (!shipmentDetails.package.declaredValue || shipmentDetails.package.declaredValue <= 0) {
            issues.push({
              field: 'package.declaredValue',
              message: 'Package declared value is missing or invalid',
              severity: 'warning'
            });
          }
        }
      }

      // Validate selected option
      if (!confirmationData.transaction.selectedOption) {
        issues.push({
          field: 'selectedOption',
          message: 'Selected shipping option is missing',
          severity: 'warning'
        });
        missingFields.push('selected_option');
      }

      // Validate payment info
      if (!confirmationData.transaction.paymentInfo) {
        issues.push({
          field: 'paymentInfo',
          message: 'Payment information is missing',
          severity: 'warning'
        });
        missingFields.push('payment_info');
      }
    }

    // Validate carrier info
    if (!confirmationData.carrierInfo) {
      issues.push({
        field: 'carrierInfo',
        message: 'Carrier information is missing',
        severity: 'error'
      });
      missingFields.push('carrier_info');
    } else {
      if (!confirmationData.carrierInfo.carrierName) {
        issues.push({
          field: 'carrierInfo.name',
          message: 'Carrier name is missing',
          severity: 'error'
        });
        missingFields.push('carrier_name');
      }
    }

    // Validate pickup confirmation
    if (!confirmationData.pickupConfirmation) {
      issues.push({
        field: 'pickupConfirmation',
        message: 'Pickup confirmation details are missing',
        severity: 'error'
      });
      missingFields.push('pickup_confirmation');
    } else {
      if (!confirmationData.pickupConfirmation.confirmedDate) {
        issues.push({
          field: 'pickupConfirmation.date',
          message: 'Pickup date is missing',
          severity: 'error'
        });
        missingFields.push('pickup_date');
      }
      
      if (confirmationData.pickupConfirmation.status !== 'confirmed') {
        issues.push({
          field: 'pickupConfirmation.status',
          message: 'Pickup is not confirmed',
          severity: 'warning'
        });
      }
    }

    // Validate delivery estimate
    if (!confirmationData.deliveryEstimate) {
      issues.push({
        field: 'deliveryEstimate',
        message: 'Delivery estimate is missing',
        severity: 'warning'
      });
      missingFields.push('delivery_estimate');
    } else {
      if (!confirmationData.deliveryEstimate.estimatedDate) {
        issues.push({
          field: 'deliveryEstimate.date',
          message: 'Estimated delivery date is missing',
          severity: 'warning'
        });
      }
    }

    // Calculate completeness score
    const totalRequiredFields = 15; // Approximate number of critical fields
    const missingCriticalFields = missingFields.filter(field => 
      ['confirmation_number', 'transaction_data', 'shipment_details', 'origin_address', 'destination_address', 'package_info', 'carrier_info'].includes(field)
    ).length;
    
    const completenessScore = Math.max(0, Math.round(((totalRequiredFields - missingCriticalFields) / totalRequiredFields) * 100));

    const hasErrors = issues.some(issue => issue.severity === 'error');
    const hasWarnings = issues.some(issue => issue.severity === 'warning');
    const isValid = !hasErrors && missingCriticalFields === 0;

    console.log('useConfirmationValidation - Validation result:', {
      isValid,
      hasErrors,
      hasWarnings,
      completenessScore,
      issuesCount: issues.length,
      missingFieldsCount: missingFields.length
    });

    return {
      isValid,
      issues,
      hasErrors,
      hasWarnings,
      completenessScore,
      missingFields
    };
  }, [confirmationData]);

  return validationResult;
}

export default useConfirmationValidation;
