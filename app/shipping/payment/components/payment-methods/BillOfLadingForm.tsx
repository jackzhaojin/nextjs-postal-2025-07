// Bill of Lading Form Component
// Task 6.1: Payment Method Selection - BOL form with validation

'use client';

import React, { useState, useCallback } from 'react';
import type { PaymentFormProps, BillOfLadingInfo, CommodityInfo, CarrierInfo, MonetaryAmount } from '@/lib/payment/types';
import { formatCurrency, formatDate, isValidPastOrTodayDate } from '@/lib/payment/utils';

export default function BillOfLadingForm({
  data,
  onChange,
  errors = [],
  isSubmitting = false,
  shipmentTotal,
  className = ''
}: PaymentFormProps) {
  console.log('Rendering BillOfLadingForm:', { data, shipmentTotal, errorCount: errors.length });

  const [localData, setLocalData] = useState<BillOfLadingInfo>(() => ({
    bolNumber: data?.billOfLading?.bolNumber || '',
    bolDate: data?.billOfLading?.bolDate || '',
    shipperReference: data?.billOfLading?.shipperReference || '',
    consigneeReference: data?.billOfLading?.consigneeReference || '',
    freightTerms: data?.billOfLading?.freightTerms || 'prepaid',
    commodity: data?.billOfLading?.commodity || {
      description: '',
      nmfcClass: '',
      weight: 0,
      pieces: 1,
      packageType: '',
      hazardousClass: ''
    },
    carrierInfo: data?.billOfLading?.carrierInfo || {
      scac: '',
      dotNumber: '',
      mcNumber: '',
      insuranceCoverage: { amount: 100000, currency: shipmentTotal.currency }
    },
    specialInstructions: data?.billOfLading?.specialInstructions || '',
    hazmatDeclaration: data?.billOfLading?.hazmatDeclaration || false,
    declaredValue: data?.billOfLading?.declaredValue || { amount: 0, currency: shipmentTotal.currency }
  }));

  const handleFieldChange = useCallback((field: keyof BillOfLadingInfo, value: any) => {
    console.log('BOL field changed:', { field, value });
    
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Trigger parent onChange
      onChange({
        ...data,
        billOfLading: updated
      });
      
      return updated;
    });
  }, [data, onChange]);

  const handleCommodityChange = useCallback((field: keyof CommodityInfo, value: any) => {
    console.log('BOL commodity field changed:', { field, value });
    
    const updatedCommodity = {
      ...localData.commodity,
      [field]: value
    };
    
    handleFieldChange('commodity', updatedCommodity);
  }, [localData.commodity, handleFieldChange]);

  const handleCarrierChange = useCallback((field: keyof CarrierInfo, value: any) => {
    console.log('BOL carrier field changed:', { field, value });
    
    const updatedCarrier = {
      ...localData.carrierInfo,
      [field]: value
    };
    
    handleFieldChange('carrierInfo', updatedCarrier);
  }, [localData.carrierInfo, handleFieldChange]);

  const handleDeclaredValueChange = useCallback((value: string) => {
    console.log('BOL declared value changed:', value);
    
    const amount = parseFloat(value) || 0;
    const updatedValue: MonetaryAmount = {
      amount,
      currency: shipmentTotal.currency
    };
    
    handleFieldChange('declaredValue', updatedValue);
  }, [shipmentTotal.currency, handleFieldChange]);

  const generateBOLNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const bolNumber = `BOL-${year}-${randomSuffix}`;
    
    console.log('Generated BOL number:', bolNumber);
    handleFieldChange('bolNumber', bolNumber);
  }, [handleFieldChange]);

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field.includes(fieldName))?.message;
  };

  const isBOLNumberValid = localData.bolNumber.match(/^BOL-\d{4}-\d{6}$/);
  const isBOLDateValid = localData.bolDate && isValidPastOrTodayDate(localData.bolDate);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Bill of Lading Information</h3>

      <div className="space-y-6">
        {/* BOL Number and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bol-number" className="block text-sm font-medium text-gray-700 mb-2">
              BOL Number *
            </label>
            <div className="flex">
              <input
                id="bol-number"
                type="text"
                value={localData.bolNumber}
                onChange={(e) => handleFieldChange('bolNumber', e.target.value)}
                placeholder="BOL-2025-123456"
                className={`flex-1 px-3 py-2 border rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('bolNumber') || !isBOLNumberValid ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={generateBOLNumber}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Generate
              </button>
            </div>
            {getFieldError('bolNumber') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('bolNumber')}</p>
            )}
            {localData.bolNumber && !isBOLNumberValid && (
              <p className="mt-1 text-sm text-red-600">
                Format must be: BOL-YYYY-XXXXXX
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: BOL-YYYY-XXXXXX (e.g., BOL-2025-123456)
            </p>
          </div>

          <div>
            <label htmlFor="bol-date" className="block text-sm font-medium text-gray-700 mb-2">
              BOL Date *
            </label>
            <input
              id="bol-date"
              type="date"
              value={localData.bolDate.split('T')[0]}
              onChange={(e) => handleFieldChange('bolDate', new Date(e.target.value).toISOString())}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('bolDate') || !isBOLDateValid ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              required
            />
            {getFieldError('bolDate') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('bolDate')}</p>
            )}
            {localData.bolDate && !isBOLDateValid && (
              <p className="mt-1 text-sm text-red-600">
                BOL date cannot be in the future
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Cannot be a future date
            </p>
          </div>
        </div>

        {/* References */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="shipper-ref" className="block text-sm font-medium text-gray-700 mb-2">
              Shipper Reference *
            </label>
            <input
              id="shipper-ref"
              type="text"
              value={localData.shipperReference}
              onChange={(e) => handleFieldChange('shipperReference', e.target.value)}
              placeholder="SH-2025-001"
              maxLength={20}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('shipperReference') ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              required
            />
            {getFieldError('shipperReference') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('shipperReference')}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Alphanumeric, max 20 characters
            </p>
          </div>

          <div>
            <label htmlFor="consignee-ref" className="block text-sm font-medium text-gray-700 mb-2">
              Consignee Reference
            </label>
            <input
              id="consignee-ref"
              type="text"
              value={localData.consigneeReference || ''}
              onChange={(e) => handleFieldChange('consigneeReference', e.target.value)}
              placeholder="CN-2025-001"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional, alphanumeric, max 20 characters
            </p>
          </div>
        </div>

        {/* Freight Terms */}
        <div>
          <label htmlFor="freight-terms" className="block text-sm font-medium text-gray-700 mb-2">
            Freight Terms *
          </label>
          <select
            id="freight-terms"
            value={localData.freightTerms}
            onChange={(e) => handleFieldChange('freightTerms', e.target.value as any)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('freightTerms') ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            required
          >
            <option value="prepaid">Prepaid</option>
            <option value="collect">Collect</option>
            <option value="prepaid-add">Prepaid & Add</option>
            <option value="third-party">Third Party</option>
          </select>
          {getFieldError('freightTerms') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('freightTerms')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Who pays the freight charges
          </p>
        </div>

        {/* Commodity Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Commodity Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="commodity-desc" className="block text-sm font-medium text-gray-700 mb-1">
                Commodity Description *
              </label>
              <textarea
                id="commodity-desc"
                value={localData.commodity.description}
                onChange={(e) => handleCommodityChange('description', e.target.value)}
                placeholder="Describe the commodity being shipped"
                rows={3}
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('commodity.description') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('commodity.description') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('commodity.description')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {localData.commodity.description.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="commodity-weight" className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight *
              </label>
              <div className="relative">
                <input
                  id="commodity-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={localData.commodity.weight}
                  onChange={(e) => handleCommodityChange('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className={`w-full px-3 py-2 pr-12 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError('commodity.weight') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">lbs</span>
                </div>
              </div>
              {getFieldError('commodity.weight') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('commodity.weight')}</p>
              )}
            </div>

            <div>
              <label htmlFor="commodity-pieces" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Pieces *
              </label>
              <input
                id="commodity-pieces"
                type="number"
                min="1"
                value={localData.commodity.pieces}
                onChange={(e) => handleCommodityChange('pieces', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('commodity.pieces') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('commodity.pieces') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('commodity.pieces')}</p>
              )}
            </div>

            <div>
              <label htmlFor="package-type" className="block text-sm font-medium text-gray-700 mb-1">
                Package Type *
              </label>
              <input
                id="package-type"
                type="text"
                value={localData.commodity.packageType}
                onChange={(e) => handleCommodityChange('packageType', e.target.value)}
                placeholder="e.g., Pallets, Boxes, Crates"
                maxLength={50}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('commodity.packageType') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('commodity.packageType') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('commodity.packageType')}</p>
              )}
            </div>

            <div>
              <label htmlFor="nmfc-class" className="block text-sm font-medium text-gray-700 mb-1">
                NMFC Class
              </label>
              <input
                id="nmfc-class"
                type="text"
                value={localData.commodity.nmfcClass || ''}
                onChange={(e) => handleCommodityChange('nmfcClass', e.target.value)}
                placeholder="e.g., 70"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                National Motor Freight Classification
              </p>
            </div>
          </div>
        </div>

        {/* Hazmat Declaration */}
        <div>
          <div className="flex items-center">
            <input
              id="hazmat-declaration"
              type="checkbox"
              checked={localData.hazmatDeclaration}
              onChange={(e) => handleFieldChange('hazmatDeclaration', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="hazmat-declaration" className="ml-2 block text-sm text-gray-900">
              This shipment contains hazardous materials
            </label>
          </div>
          
          {localData.hazmatDeclaration && (
            <div className="mt-3">
              <label htmlFor="hazardous-class" className="block text-sm font-medium text-gray-700 mb-1">
                Hazardous Class
              </label>
              <input
                id="hazardous-class"
                type="text"
                value={localData.commodity.hazardousClass || ''}
                onChange={(e) => handleCommodityChange('hazardousClass', e.target.value)}
                placeholder="e.g., Class 3 (Flammable Liquids)"
                maxLength={10}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Declared Value */}
        <div>
          <label htmlFor="declared-value" className="block text-sm font-medium text-gray-700 mb-2">
            Declared Value *
          </label>
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="declared-value"
              type="number"
              min="0"
              step="0.01"
              value={localData.declaredValue.amount}
              onChange={(e) => handleDeclaredValueChange(e.target.value)}
              placeholder="0.00"
              className={`w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('declaredValue') ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              required
            />
          </div>
          {getFieldError('declaredValue') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('declaredValue')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Value of the commodities for insurance purposes
          </p>
        </div>

        {/* Special Instructions */}
        <div>
          <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions
          </label>
          <textarea
            id="special-instructions"
            value={localData.specialInstructions || ''}
            onChange={(e) => handleFieldChange('specialInstructions', e.target.value)}
            placeholder="Any special handling or delivery instructions"
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            {(localData.specialInstructions || '').length}/1000 characters
          </p>
        </div>

        {/* Validation Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Summary</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center ${isBOLNumberValid ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{isBOLNumberValid ? '✓' : '✗'}</span>
              BOL number format valid
            </div>
            <div className={`flex items-center ${isBOLDateValid ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{isBOLDateValid ? '✓' : '✗'}</span>
              BOL date valid
            </div>
            <div className={`flex items-center ${localData.shipperReference ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.shipperReference ? '✓' : '○'}</span>
              Shipper reference provided
            </div>
            <div className={`flex items-center ${localData.commodity.description ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.commodity.description ? '✓' : '○'}</span>
              Commodity description provided
            </div>
            <div className={`flex items-center ${localData.commodity.weight > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.commodity.weight > 0 ? '✓' : '○'}</span>
              Weight specified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}