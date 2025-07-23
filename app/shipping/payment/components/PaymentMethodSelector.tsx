// Payment Method Selector Component
// Task 6.1: Payment Method Selection - Radio card selector for payment methods

'use client';

import React from 'react';
import type { PaymentMethodType, PaymentMethodConfig, MonetaryAmount } from '@/lib/payment/types';
import { formatCurrency, validatePaymentMethodEligibility } from '@/lib/payment/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType | null;
  onSelect: (method: PaymentMethodType) => void;
  shipmentTotal: MonetaryAmount;
  paymentMethodConfigs: PaymentMethodConfig[];
  customerType?: string;
  className?: string;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  shipmentTotal,
  paymentMethodConfigs,
  customerType = 'business',
  className = ''
}: PaymentMethodSelectorProps) {
  console.log('Rendering PaymentMethodSelector:', {
    selectedMethod,
    shipmentTotal,
    customerType,
    configCount: paymentMethodConfigs.length
  });

  const handleMethodSelect = (method: PaymentMethodType) => {
    console.log('Payment method selected:', method);
    onSelect(method);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethodConfigs.map((config) => {
          const eligibility = validatePaymentMethodEligibility(
            config.method,
            shipmentTotal,
            customerType
          );

          const isSelected = selectedMethod === config.method;
          const isDisabled = !config.isEnabled || !eligibility.eligible;

          return (
            <PaymentMethodCard
              key={config.method}
              config={config}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onSelect={() => handleMethodSelect(config.method)}
              eligibilityReasons={eligibility.reasons}
              shipmentTotal={shipmentTotal}
            />
          );
        })}
      </div>

      {/* Selected Method Details */}
      {selectedMethod && (
        <SelectedMethodDetails
          config={paymentMethodConfigs.find(c => c.method === selectedMethod)!}
          shipmentTotal={shipmentTotal}
        />
      )}
    </div>
  );
}

interface PaymentMethodCardProps {
  config: PaymentMethodConfig;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  eligibilityReasons: string[];
  shipmentTotal: MonetaryAmount;
}

function PaymentMethodCard({
  config,
  isSelected,
  isDisabled,
  onSelect,
  eligibilityReasons,
  shipmentTotal
}: PaymentMethodCardProps) {
  const totalFees = config.fees.reduce((sum, fee) => {
    if (fee.percentage) {
      return sum + (shipmentTotal.amount * fee.percentage / 100);
    }
    return sum + fee.amount.amount;
  }, 0);

  return (
    <div
      className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : isDisabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={!isDisabled ? onSelect : undefined}
    >
      <div className="p-4">
        {/* Radio Button */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="radio"
              checked={isSelected}
              onChange={onSelect}
              disabled={isDisabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
              aria-describedby={`${config.method}-description`}
            />
          </div>
          <div className="ml-3 flex-1">
            {/* Method Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2" role="img" aria-label={config.displayName}>
                  {config.icon}
                </span>
                <label className="text-base font-medium text-gray-900 cursor-pointer">
                  {config.displayName}
                </label>
              </div>
              {totalFees > 0 && (
                <span className="text-sm text-gray-500">
                  +{formatCurrency({ amount: totalFees, currency: shipmentTotal.currency })}
                </span>
              )}
            </div>

            {/* Description */}
            <p 
              id={`${config.method}-description`}
              className="text-sm text-gray-600 mt-1"
            >
              {config.description}
            </p>

            {/* Fees Display */}
            {config.fees.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500">
                  {config.fees.map((fee, index) => (
                    <div key={index}>
                      {fee.description}: {
                        fee.percentage 
                          ? `${fee.percentage}%`
                          : formatCurrency(fee.amount)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ineligibility Reasons */}
            {isDisabled && eligibilityReasons.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-red-600">
                  <div className="font-medium">Not available:</div>
                  <ul className="list-disc list-inside mt-1">
                    {eligibilityReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Requirements Hint */}
            {!isDisabled && (
              <div className="mt-2">
                <div className="text-xs text-gray-500">
                  Required: {config.requirements
                    .filter(req => req.required)
                    .map(req => req.field)
                    .join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="bg-blue-600 rounded-full p-1">
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectedMethodDetailsProps {
  config: PaymentMethodConfig;
  shipmentTotal: MonetaryAmount;
}

function SelectedMethodDetails({ config, shipmentTotal }: SelectedMethodDetailsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium text-blue-900 mb-3">
        {config.displayName} Requirements
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Required Fields */}
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-2">Required Information</h4>
          <ul className="space-y-1">
            {config.requirements
              .filter(req => req.required)
              .map((req, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <div>
                    <span className="font-medium">{req.description}</span>
                    {req.format && (
                      <div className="text-xs text-blue-600 mt-1">
                        Format: {req.format}
                      </div>
                    )}
                    {req.example && (
                      <div className="text-xs text-blue-600 mt-1">
                        Example: {req.example}
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Optional Fields */}
        {config.requirements.some(req => !req.required) && (
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">Optional Information</h4>
            <ul className="space-y-1">
              {config.requirements
                .filter(req => !req.required)
                .map((req, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="text-blue-400 mr-2">◦</span>
                    <div>
                      <span>{req.description}</span>
                      {req.format && (
                        <div className="text-xs text-blue-600 mt-1">
                          Format: {req.format}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fees Breakdown */}
      {config.fees.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Additional Fees</h4>
          <div className="space-y-1">
            {config.fees.map((fee, index) => {
              const feeAmount = fee.percentage 
                ? shipmentTotal.amount * fee.percentage / 100
                : fee.amount.amount;
              
              return (
                <div key={index} className="flex justify-between text-sm text-blue-700">
                  <span>{fee.description}</span>
                  <span>
                    {fee.percentage && `${fee.percentage}% = `}
                    {formatCurrency({ amount: feeAmount, currency: shipmentTotal.currency })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Eligibility Info */}
      {config.eligibilityCriteria.minimumShipmentValue && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Eligibility</h4>
          <div className="text-sm text-blue-700">
            <div>Minimum shipment value: {formatCurrency(config.eligibilityCriteria.minimumShipmentValue)}</div>
            <div>Available for: {config.eligibilityCriteria.allowedCustomerTypes.join(', ')} customers</div>
          </div>
        </div>
      )}
    </div>
  );
}