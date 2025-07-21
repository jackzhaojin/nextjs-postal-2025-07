'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Address, ContactInfo } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon, MapPinIcon, PhoneIcon, MailIcon, BuildingIcon, CheckIcon } from 'lucide-react';

interface AddressInputProps {
  value: Address;
  onChange: (address: Address) => void;
  label: string;
  errors?: Record<string, string>;
  required?: boolean;
  showContactInfo?: boolean;
  type?: 'origin' | 'destination';
}

interface AddressSuggestion {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  displayText: string;
  isCommercial?: boolean;
}

export function AddressInput({
  value,
  onChange,
  label,
  errors = {},
  required = false,
  showContactInfo = true,
  type = 'origin'
}: AddressInputProps) {
  console.log(`AddressInput: Rendering ${type} address input`);
  console.log('AddressInput: Current value:', value);
  
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  console.log('AddressInput: Current state - suggestions:', suggestions.length, 'showSuggestions:', showSuggestions);

  // Debounced address search
  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    console.log('AddressInput: Searching for addresses with query:', query);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/address-search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await response.json();
      
      if (data.success && data.suggestions) {
        console.log('AddressInput: Received suggestions:', data.suggestions.length);
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else {
        console.warn('AddressInput: Address search failed:', data.error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('AddressInput: Address search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Handle address field change with debounced search
  const handleAddressChange = useCallback((newAddress: string) => {
    console.log('AddressInput: Address field changed:', newAddress);
    setSearchTerm(newAddress);
    
    onChange({
      ...value,
      address: newAddress
    });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search by 300ms
    timeoutRef.current = setTimeout(() => {
      searchAddresses(newAddress);
    }, 300);
  }, [value, onChange, searchAddresses]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: AddressSuggestion) => {
    console.log('AddressInput: Suggestion selected:', suggestion);
    
    const updatedAddress: Address = {
      ...value,
      address: suggestion.address,
      city: suggestion.city,
      state: suggestion.state,
      zip: suggestion.zip,
      country: suggestion.country,
      isResidential: !suggestion.isCommercial,
      locationType: suggestion.isCommercial ? 'commercial' : 'residential'
    };

    onChange(updatedAddress);
    setSearchTerm(suggestion.address);
    setShowSuggestions(false);
    setSuggestions([]);
  }, [value, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, handleSuggestionSelect]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle location type change
  const handleLocationTypeChange = useCallback((locationType: Address['locationType']) => {
    console.log('AddressInput: Location type changed:', locationType);
    onChange({
      ...value,
      locationType,
      isResidential: locationType === 'residential'
    });
  }, [value, onChange]);

  // Handle contact info change
  const handleContactInfoChange = useCallback((field: keyof ContactInfo, fieldValue: string) => {
    console.log('AddressInput: Contact info changed:', field, fieldValue);
    onChange({
      ...value,
      contactInfo: {
        ...value.contactInfo,
        [field]: fieldValue
      }
    });
  }, [value, onChange]);

  return (
    <Card className="rounded-3xl shadow-[0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPinIcon className="w-5 h-5 text-blue-600" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Address Input with Autocomplete */}
        <div className="space-y-1 relative" ref={suggestionsRef}>
          <Label htmlFor={`${type}-address`} className="text-sm font-medium">
            Street Address {required && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <Input
              id={`${type}-address`}
              value={value.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter street address..."
              className={`rounded-xl ${errors.address ? 'border-red-500' : ''}`}
              aria-describedby={errors.address ? `${type}-address-error` : undefined}
              autoComplete="address-line1"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {/* Address Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                    index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.displayText}</div>
                      <div className="text-sm text-gray-500">
                        {suggestion.city}, {suggestion.state} {suggestion.zip}
                      </div>
                    </div>
                    {suggestion.isCommercial && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <BuildingIcon className="w-3 h-3 mr-1" />
                        Commercial
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {errors.address && (
            <p id={`${type}-address-error`} className="text-sm text-red-600 mt-1">
              {errors.address}
            </p>
          )}
        </div>

        {/* Suite/Unit */}
        <div className="space-y-1">
          <Label htmlFor={`${type}-suite`} className="text-sm font-medium">
            Suite/Unit (Optional)
          </Label>
          <Input
            id={`${type}-suite`}
            value={value.suite || ''}
            onChange={(e) => onChange({ ...value, suite: e.target.value })}
            placeholder="Suite, unit, or apartment number"
            className="rounded-xl"
            autoComplete="address-line2"
          />
        </div>

        {/* City, State, ZIP Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${type}-city`} className="text-sm font-medium">
              City {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${type}-city`}
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="City"
              className={`rounded-xl ${errors.city ? 'border-red-500' : ''}`}
              autoComplete="address-level2"
            />
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${type}-state`} className="text-sm font-medium">
              State {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${type}-state`}
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
              placeholder="State"
              className={`rounded-xl ${errors.state ? 'border-red-500' : ''}`}
              autoComplete="address-level1"
            />
            {errors.state && (
              <p className="text-sm text-red-600 mt-1">{errors.state}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${type}-zip`} className="text-sm font-medium">
              ZIP Code {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${type}-zip`}
              value={value.zip}
              onChange={(e) => onChange({ ...value, zip: e.target.value })}
              placeholder="ZIP Code"
              className={`rounded-xl ${errors.zip ? 'border-red-500' : ''}`}
              autoComplete="postal-code"
            />
            {errors.zip && (
              <p className="text-sm text-red-600 mt-1">{errors.zip}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <Label htmlFor={`${type}-country`} className="text-sm font-medium">
            Country {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`${type}-country`}
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
            placeholder="Country"
            className={`rounded-xl ${errors.country ? 'border-red-500' : ''}`}
            autoComplete="country-name"
          />
          {errors.country && (
            <p className="text-sm text-red-600 mt-1">{errors.country}</p>
          )}
        </div>

        {/* Location Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Location Type {required && <span className="text-red-500">*</span>}
          </Label>
          <RadioGroup
            value={value.locationType}
            onValueChange={handleLocationTypeChange}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {[
              { value: 'commercial', label: 'Commercial', desc: 'Business address' },
              { value: 'residential', label: 'Residential', desc: 'Home address' },
              { value: 'industrial', label: 'Industrial', desc: 'Factory/warehouse' },
              { value: 'warehouse', label: 'Warehouse', desc: 'Storage facility' },
              { value: 'construction', label: 'Construction', desc: 'Job site' },
              { value: 'other', label: 'Other', desc: 'Specify below' }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-xl hover:bg-gray-50">
                <RadioGroupItem value={option.value} id={`${type}-${option.value}`} />
                <div className="flex-1">
                  <Label 
                    htmlFor={`${type}-${option.value}`} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.locationType && (
            <p className="text-sm text-red-600 mt-1">{errors.locationType}</p>
          )}
        </div>

        {/* Location Description (for "Other" location type) */}
        {value.locationType === 'other' && (
          <div className="space-y-1">
            <Label htmlFor={`${type}-location-desc`} className="text-sm font-medium">
              Location Description {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${type}-location-desc`}
              value={value.locationDescription || ''}
              onChange={(e) => onChange({ ...value, locationDescription: e.target.value })}
              placeholder="Describe the location type"
              className="rounded-xl"
            />
          </div>
        )}

        {/* Contact Information */}
        {showContactInfo && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-blue-600" />
              Contact Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`${type}-contact-name`} className="text-sm font-medium">
                  Contact Name {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={`${type}-contact-name`}
                  value={value.contactInfo.name}
                  onChange={(e) => handleContactInfoChange('name', e.target.value)}
                  placeholder="Full name"
                  className={`rounded-xl ${errors['contactInfo.name'] ? 'border-red-500' : ''}`}
                  autoComplete="name"
                />
                {errors['contactInfo.name'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['contactInfo.name']}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`${type}-contact-company`} className="text-sm font-medium">
                  Company Name
                </Label>
                <Input
                  id={`${type}-contact-company`}
                  value={value.contactInfo.company || ''}
                  onChange={(e) => handleContactInfoChange('company', e.target.value)}
                  placeholder="Company name"
                  className="rounded-xl"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`${type}-contact-phone`} className="text-sm font-medium">
                  Phone Number {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={`${type}-contact-phone`}
                  type="tel"
                  value={value.contactInfo.phone}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className={`rounded-xl ${errors['contactInfo.phone'] ? 'border-red-500' : ''}`}
                  autoComplete="tel"
                />
                {errors['contactInfo.phone'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['contactInfo.phone']}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`${type}-contact-ext`} className="text-sm font-medium">
                  Extension
                </Label>
                <Input
                  id={`${type}-contact-ext`}
                  value={value.contactInfo.extension || ''}
                  onChange={(e) => handleContactInfoChange('extension', e.target.value)}
                  placeholder="Ext."
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`${type}-contact-email`} className="text-sm font-medium flex items-center gap-1">
                <MailIcon className="w-4 h-4" />
                Email Address {required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={`${type}-contact-email`}
                type="email"
                value={value.contactInfo.email}
                onChange={(e) => handleContactInfoChange('email', e.target.value)}
                placeholder="contact@company.com"
                className={`rounded-xl ${errors['contactInfo.email'] ? 'border-red-500' : ''}`}
                autoComplete="email"
              />
              {errors['contactInfo.email'] && (
                <p className="text-sm text-red-600 mt-1">{errors['contactInfo.email']}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}