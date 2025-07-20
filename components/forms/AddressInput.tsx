'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin } from 'lucide-react';
import { Address } from '@/lib/types';

interface AddressInputProps {
  title: string;
  address: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  icon?: React.ReactNode;
  iconColor?: string;
  errors?: Record<string, string>;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

export function AddressInput({ 
  title, 
  address, 
  onChange, 
  icon = <MapPin className="h-5 w-5" />, 
  iconColor = "text-blue-600",
  errors = {}
}: AddressInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateField = (field: keyof Address, value: any) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  const updateContactInfo = (field: string, value: any) => {
    onChange({
      ...address,
      contactInfo: {
        ...address.contactInfo,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-name`}>Contact Name *</Label>
              <Input
                id={`${title.toLowerCase()}-name`}
                value={address.contactInfo?.name || ''}
                onChange={(e) => updateContactInfo('name', e.target.value)}
                placeholder="Enter contact name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-company`}>Company</Label>
              <Input
                id={`${title.toLowerCase()}-company`}
                value={address.contactInfo?.company || ''}
                onChange={(e) => updateContactInfo('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-phone`}>Phone Number *</Label>
              <Input
                id={`${title.toLowerCase()}-phone`}
                type="tel"
                value={address.contactInfo?.phone || ''}
                onChange={(e) => updateContactInfo('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-email`}>Email</Label>
              <Input
                id={`${title.toLowerCase()}-email`}
                type="email"
                value={address.contactInfo?.email || ''}
                onChange={(e) => updateContactInfo('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Address Information</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-address`}>Street Address *</Label>
              <Input
                id={`${title.toLowerCase()}-address`}
                value={address.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Enter street address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-suite`}>Suite/Unit (Optional)</Label>
              <Input
                id={`${title.toLowerCase()}-suite`}
                value={address.suite || ''}
                onChange={(e) => updateField('suite', e.target.value)}
                placeholder="Suite, unit, building, floor, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${title.toLowerCase()}-city`}>City *</Label>
                <Input
                  id={`${title.toLowerCase()}-city`}
                  value={address.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter city"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${title.toLowerCase()}-state`}>State *</Label>
                <Select 
                  value={address.state || ''} 
                  onValueChange={(value) => updateField('state', value)}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${title.toLowerCase()}-zip`}>ZIP Code *</Label>
                <Input
                  id={`${title.toLowerCase()}-zip`}
                  value={address.zip || ''}
                  onChange={(e) => updateField('zip', e.target.value)}
                  placeholder="12345"
                  maxLength={10}
                  className={errors.zip ? 'border-red-500' : ''}
                />
                {errors.zip && (
                  <p className="text-sm text-red-600">{errors.zip}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Type */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Location Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-location-type`}>Location Type *</Label>
              <Select 
                value={address.locationType || ''} 
                onValueChange={(value) => updateField('locationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="storage">Storage Facility</SelectItem>
                  <SelectItem value="construction">Construction Site</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor={`${title.toLowerCase()}-location-desc`}>Location Description</Label>
              <Input
                id={`${title.toLowerCase()}-location-desc`}
                value={address.locationDescription || ''}
                onChange={(e) => updateField('locationDescription', e.target.value)}
                placeholder="Additional location details..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${title.toLowerCase()}-residential`}
              checked={address.isResidential || false}
              onCheckedChange={(checked) => updateField('isResidential', checked)}
            />
            <Label htmlFor={`${title.toLowerCase()}-residential`} className="text-sm">
              This is a residential address (affects pricing and delivery options)
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}