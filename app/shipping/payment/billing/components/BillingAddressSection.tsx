'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { BillingAddress } from '@/lib/billing/types';
import { Address } from '@/lib/types';

interface BillingAddressSectionProps {
  billingAddress: BillingAddress;
  sameAsOriginAddress: boolean;
  originAddress?: Address;
  onBillingAddressChange: (address: BillingAddress) => void;
  onSameAsOriginChange: (same: boolean) => void;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function BillingAddressSection({
  billingAddress,
  sameAsOriginAddress,
  originAddress,
  onBillingAddressChange,
  onSameAsOriginChange,
  validationErrors,
  isSubmitting
}: BillingAddressSectionProps) {
  console.log('🏢 [BILLING] BillingAddressSection rendered with validation errors:', validationErrors);

  const handleFieldChange = (field: keyof BillingAddress, value: string | boolean) => {
    console.log(`🏢 [BILLING] Address field changed: ${field} = ${value}`);
    
    const updatedAddress = {
      ...billingAddress,
      [field]: value,
      lastUpdated: new Date().toISOString()
    };
    
    onBillingAddressChange(updatedAddress);
  };

  const handleSameAsOriginChange = (checked: boolean) => {
    console.log(`🏢 [BILLING] Same as origin address changed: ${checked}`);
    
    onSameAsOriginChange(checked);
    
    if (checked && originAddress) {
      console.log('🏢 [BILLING] Auto-filling billing address from origin address');
      
      const autoFilledAddress: BillingAddress = {
        streetAddress: originAddress.address,
        suite: originAddress.suite || '',
        city: originAddress.city,
        state: originAddress.state,
        postalCode: originAddress.zip,
        country: originAddress.country,
        isCommercial: originAddress.locationType === 'commercial',
        isValidated: false,
        addressType: originAddress.locationType === 'commercial' ? 'commercial' : 'residential',
        validationSource: 'user'
      };
      
      onBillingAddressChange(autoFilledAddress);
    }
  };

  const getValidationIcon = () => {
    if (billingAddress.isValidated && billingAddress.validationSource === 'api') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (billingAddress.addressType === 'residential') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <MapPin className="w-4 h-4 text-gray-400" />;
  };

  const getValidationMessage = () => {
    if (billingAddress.isValidated && billingAddress.validationSource === 'api') {
      return 'Address verified';
    }
    if (billingAddress.addressType === 'residential') {
      return 'Residential address detected - commercial preferred for billing';
    }
    return 'Address validation pending';
  };

  return (
    <Card className="w-full" data-testid="billing-address-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Billing Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Same as Origin Address Checkbox */}
        {originAddress && (
          <div className="flex items-center space-x-2" data-testid="same-as-origin-checkbox">
            <Checkbox
              id="same-as-origin"
              checked={sameAsOriginAddress}
              onCheckedChange={handleSameAsOriginChange}
              disabled={isSubmitting}
            />
            <Label htmlFor="same-as-origin" className="text-sm font-medium">
              Use same address as origin location
            </Label>
          </div>
        )}

        {/* Address Validation Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {getValidationIcon()}
          <span className="text-sm text-gray-700">{getValidationMessage()}</span>
          {billingAddress.isCommercial && (
            <Badge variant="outline" className="ml-auto">Commercial</Badge>
          )}
        </div>

        {/* Street Address */}
        <div className="space-y-2">
          <Label htmlFor="billing-street-address" className="text-sm font-medium">
            Street Address *
          </Label>
          <Input
            id="billing-street-address"
            data-testid="billing-street-address"
            type="text"
            value={billingAddress.streetAddress}
            onChange={(e) => handleFieldChange('streetAddress', e.target.value)}
            placeholder="123 Business Ave"
            disabled={isSubmitting || sameAsOriginAddress}
            className={validationErrors['billingAddress.streetAddress'] ? 'border-red-500' : ''}
          />
          {validationErrors['billingAddress.streetAddress'] && (
            <p className="text-sm text-red-600" data-testid="error-billing-street-address">
              {validationErrors['billingAddress.streetAddress']}
            </p>
          )}
        </div>

        {/* Suite/Unit */}
        <div className="space-y-2">
          <Label htmlFor="billing-suite" className="text-sm font-medium">
            Suite/Unit (Optional)
          </Label>
          <Input
            id="billing-suite"
            data-testid="billing-suite"
            type="text"
            value={billingAddress.suite || ''}
            onChange={(e) => handleFieldChange('suite', e.target.value)}
            placeholder="Suite 100"
            disabled={isSubmitting || sameAsOriginAddress}
          />
        </div>

        {/* City, State, ZIP Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="billing-city" className="text-sm font-medium">
              City *
            </Label>
            <Input
              id="billing-city"
              data-testid="billing-city"
              type="text"
              value={billingAddress.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              placeholder="Business City"
              disabled={isSubmitting || sameAsOriginAddress}
              className={validationErrors['billingAddress.city'] ? 'border-red-500' : ''}
            />
            {validationErrors['billingAddress.city'] && (
              <p className="text-sm text-red-600" data-testid="error-billing-city">
                {validationErrors['billingAddress.city']}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="billing-state" className="text-sm font-medium">
              State *
            </Label>
            <Select
              value={billingAddress.state}
              onValueChange={(value) => handleFieldChange('state', value)}
              disabled={isSubmitting || sameAsOriginAddress}
            >
              <SelectTrigger 
                id="billing-state"
                data-testid="billing-state"
                className={validationErrors['billingAddress.state'] ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors['billingAddress.state'] && (
              <p className="text-sm text-red-600" data-testid="error-billing-state">
                {validationErrors['billingAddress.state']}
              </p>
            )}
          </div>

          {/* ZIP Code */}
          <div className="space-y-2">
            <Label htmlFor="billing-postal-code" className="text-sm font-medium">
              ZIP Code *
            </Label>
            <Input
              id="billing-postal-code"
              data-testid="billing-postal-code"
              type="text"
              value={billingAddress.postalCode}
              onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              placeholder="12345"
              disabled={isSubmitting || sameAsOriginAddress}
              className={validationErrors['billingAddress.postalCode'] ? 'border-red-500' : ''}
            />
            {validationErrors['billingAddress.postalCode'] && (
              <p className="text-sm text-red-600" data-testid="error-billing-postal-code">
                {validationErrors['billingAddress.postalCode']}
              </p>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="billing-country" className="text-sm font-medium">
            Country *
          </Label>
          <Select
            value={billingAddress.country}
            onValueChange={(value) => handleFieldChange('country', value)}
            disabled={isSubmitting || sameAsOriginAddress}
          >
            <SelectTrigger 
              id="billing-country"
              data-testid="billing-country"
              className={validationErrors['billingAddress.country'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['billingAddress.country'] && (
            <p className="text-sm text-red-600" data-testid="error-billing-country">
              {validationErrors['billingAddress.country']}
            </p>
          )}
        </div>

        {/* Address Type Indicator */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              billingAddress.addressType === 'commercial' ? 'bg-green-500' : 
              billingAddress.addressType === 'residential' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">
              Address Type: {billingAddress.addressType || 'Unknown'}
            </span>
          </div>
          {billingAddress.deliverabilityScore && (
            <Badge variant="outline">
              Deliverability: {Math.round(billingAddress.deliverabilityScore * 100)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default BillingAddressSection;
