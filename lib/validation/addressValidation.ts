import { Address, ContactInfo, ValidationError } from '@/lib/types';

interface AddressValidationRules {
  required: boolean;
  validateFormat: boolean;
  allowInternational: boolean;
  validateServiceArea: boolean;
}

interface AddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export class AddressValidator {
  
  static validateAddress(
    address: Address, 
    rules: AddressValidationRules = { 
      required: true, 
      validateFormat: true, 
      allowInternational: true,
      validateServiceArea: false
    }
  ): AddressValidationResult {
    console.log('AddressValidator: Validating address:', address);
    console.log('AddressValidator: Validation rules:', rules);
    
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Basic required field validation
    if (rules.required) {
      if (!address.address?.trim()) {
        errors.address = 'Street address is required';
      }
      if (!address.city?.trim()) {
        errors.city = 'City is required';
      }
      if (!address.state?.trim()) {
        errors.state = 'State is required';
      }
      if (!address.zip?.trim()) {
        errors.zip = 'ZIP code is required';
      }
      if (!address.country?.trim()) {
        errors.country = 'Country is required';
      }
      if (!address.locationType) {
        errors.locationType = 'Location type is required';
      }
    }

    // Location description required for "other" type
    if (address.locationType === 'other' && !address.locationDescription?.trim()) {
      errors.locationDescription = 'Location description is required when selecting "Other"';
    }

    // Format validation
    if (rules.validateFormat) {
      // ZIP code format validation
      if (address.zip) {
        const zipValidation = this.validateZipCode(address.zip, address.country);
        if (!zipValidation.isValid) {
          errors.zip = zipValidation.error || 'Invalid ZIP code format';
        }
      }

      // State validation for US addresses
      if (address.country === 'USA' || address.country === 'US') {
        const stateValidation = this.validateUSState(address.state);
        if (!stateValidation.isValid) {
          errors.state = stateValidation.error || 'Invalid state';
        }
      }

      // Address format validation
      if (address.address) {
        const addressValidation = this.validateAddressFormat(address.address);
        if (!addressValidation.isValid) {
          warnings.address = addressValidation.warning || 'Address format may be invalid';
        }
      }
    }

    // Service area validation
    if (rules.validateServiceArea && address.zip) {
      const serviceAreaValidation = this.validateServiceArea(address.zip, address.country);
      if (!serviceAreaValidation.isValid) {
        warnings.serviceArea = serviceAreaValidation.warning || 'Service area may not be available';
      }
    }

    // Cross-field validation
    if (address.zip && address.state && address.country) {
      const crossValidation = this.validateZipStateMatch(address.zip, address.state, address.country);
      if (!crossValidation.isValid) {
        warnings.zipState = crossValidation.warning || 'ZIP code and state may not match';
      }
    }

    const isValid = Object.keys(errors).length === 0;
    
    console.log('AddressValidator: Validation result - isValid:', isValid, 'errors:', errors, 'warnings:', warnings);
    
    return {
      isValid,
      errors,
      warnings
    };
  }

  static validateContactInfo(
    contactInfo: ContactInfo,
    required: boolean = true
  ): AddressValidationResult {
    console.log('AddressValidator: Validating contact info:', contactInfo);
    
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Required field validation
    if (required) {
      if (!contactInfo.name?.trim()) {
        errors['contactInfo.name'] = 'Contact name is required';
      }
      if (!contactInfo.phone?.trim()) {
        errors['contactInfo.phone'] = 'Phone number is required';
      }
      if (!contactInfo.email?.trim()) {
        errors['contactInfo.email'] = 'Email address is required';
      }
    }

    // Phone validation
    if (contactInfo.phone) {
      const phoneValidation = this.validatePhoneNumber(contactInfo.phone);
      if (!phoneValidation.isValid) {
        errors['contactInfo.phone'] = phoneValidation.error || 'Invalid phone number';
      }
    }

    // Email validation
    if (contactInfo.email) {
      const emailValidation = this.validateEmail(contactInfo.email);
      if (!emailValidation.isValid) {
        errors['contactInfo.email'] = emailValidation.error || 'Invalid email address';
      }
    }

    // Extension validation
    if (contactInfo.extension) {
      const extValidation = this.validateExtension(contactInfo.extension);
      if (!extValidation.isValid) {
        warnings['contactInfo.extension'] = extValidation.warning || 'Extension format may be invalid';
      }
    }

    const isValid = Object.keys(errors).length === 0;
    
    console.log('AddressValidator: Contact validation result - isValid:', isValid, 'errors:', errors);
    
    return {
      isValid,
      errors,
      warnings
    };
  }

  private static validateZipCode(zip: string, country: string = 'USA'): { isValid: boolean; error?: string } {
    console.log('AddressValidator: Validating ZIP code:', zip, 'for country:', country);
    
    const cleanZip = zip.trim();
    
    switch (country.toUpperCase()) {
      case 'USA':
      case 'US':
        // US ZIP code: 5 digits or 5+4 format
        const usZipPattern = /^(\d{5})(-\d{4})?$/;
        if (!usZipPattern.test(cleanZip)) {
          return { isValid: false, error: 'ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)' };
        }
        break;
      case 'CANADA':
      case 'CA':
        // Canadian postal code: A1A 1A1 format
        const canadaPattern = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
        if (!canadaPattern.test(cleanZip)) {
          return { isValid: false, error: 'Postal code must be in format A1A 1A1' };
        }
        break;
      case 'MEXICO':
      case 'MX':
        // Mexican postal code: 5 digits
        const mexicoPattern = /^\d{5}$/;
        if (!mexicoPattern.test(cleanZip)) {
          return { isValid: false, error: 'Postal code must be 5 digits' };
        }
        break;
      default:
        // Generic validation for other countries
        if (cleanZip.length < 3 || cleanZip.length > 10) {
          return { isValid: false, error: 'Postal code must be 3-10 characters' };
        }
    }

    return { isValid: true };
  }

  private static validateUSState(state: string): { isValid: boolean; error?: string } {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC' // District of Columbia
    ];

    const cleanState = state.trim().toUpperCase();
    
    if (!validStates.includes(cleanState)) {
      return { isValid: false, error: 'Please enter a valid US state code (e.g., CA, NY, TX)' };
    }

    return { isValid: true };
  }

  private static validateAddressFormat(address: string): { isValid: boolean; warning?: string } {
    const cleanAddress = address.trim();
    
    // Check for minimum address components
    if (cleanAddress.length < 5) {
      return { isValid: false, warning: 'Address seems too short - please include street number and name' };
    }

    // Check for common address patterns
    const hasNumber = /\d/.test(cleanAddress);
    const hasStreetType = /\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|court|ct|place|pl|circle|cir)\b/i.test(cleanAddress);
    
    if (!hasNumber) {
      return { isValid: true, warning: 'Address should typically include a street number' };
    }

    if (!hasStreetType) {
      return { isValid: true, warning: 'Address should include street type (St, Ave, Rd, etc.)' };
    }

    return { isValid: true };
  }

  private static validateServiceArea(zip: string, country: string): { isValid: boolean; warning?: string } {
    // Mock service area validation - in production this would check against real service areas
    const restrictedZips = ['99999', '00000', '11111'];
    
    if (restrictedZips.includes(zip)) {
      return { isValid: false, warning: 'Service may be limited in this area - please contact customer service' };
    }

    // Mock remote area detection
    const remoteAreaPrefixes = ['997', '998', '999'];
    const zipPrefix = zip.substring(0, 3);
    
    if (remoteAreaPrefixes.includes(zipPrefix)) {
      return { isValid: true, warning: 'This location may require additional transit time and fees' };
    }

    return { isValid: true };
  }

  private static validateZipStateMatch(zip: string, state: string, country: string): { isValid: boolean; warning?: string } {
    // Mock ZIP/state validation - in production this would use a real ZIP database
    if (country.toUpperCase() !== 'USA' && country.toUpperCase() !== 'US') {
      return { isValid: true };
    }

    // Simple mock validation for common mismatches
    const zipStateMap: Record<string, string[]> = {
      '90': ['CA'], // California
      '100': ['NY'], // New York
      '600': ['IL'], // Illinois
      '770': ['TX'], // Texas
      '331': ['FL'], // Florida
    };

    const zipPrefix = zip.substring(0, 2);
    const expectedStates = zipStateMap[zipPrefix];
    
    if (expectedStates && !expectedStates.includes(state.toUpperCase())) {
      return { 
        isValid: true, 
        warning: `ZIP code ${zip} may not match state ${state} - please verify address` 
      };
    }

    return { isValid: true };
  }

  private static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    console.log('AddressValidator: Validating phone number:', phone);
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // US phone number should be 10 digits
    if (digits.length !== 10) {
      return { isValid: false, error: 'Phone number must be 10 digits' };
    }

    // Check for invalid patterns
    if (digits.startsWith('0') || digits.startsWith('1')) {
      return { isValid: false, error: 'Phone number cannot start with 0 or 1' };
    }

    // Check for all same digits
    if (new Set(digits).size === 1) {
      return { isValid: false, error: 'Phone number cannot be all the same digit' };
    }

    return { isValid: true };
  }

  private static validateEmail(email: string): { isValid: boolean; error?: string } {
    console.log('AddressValidator: Validating email:', email);
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailPattern.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Check for common typos
    const commonTlds = ['com', 'org', 'net', 'edu', 'gov'];
    const emailParts = email.toLowerCase().split('.');
    const tld = emailParts[emailParts.length - 1];
    
    if (tld.length === 2 && !commonTlds.includes(tld)) {
      return { isValid: true }; // Still valid, but could suggest common TLDs
    }

    return { isValid: true };
  }

  private static validateExtension(extension: string): { isValid: boolean; warning?: string } {
    const cleanExt = extension.trim();
    
    // Extension should be numeric and reasonable length
    if (!/^\d+$/.test(cleanExt)) {
      return { isValid: true, warning: 'Extension should contain only numbers' };
    }

    if (cleanExt.length > 8) {
      return { isValid: true, warning: 'Extension seems unusually long' };
    }

    return { isValid: true };
  }

  // Utility method to validate that origin and destination are different
  static validateAddressesDifferent(origin: Address, destination: Address): { isValid: boolean; error?: string } {
    console.log('AddressValidator: Checking addresses are different');
    
    // Compare key address components
    const originKey = `${origin.address?.toLowerCase().trim()}_${origin.city?.toLowerCase().trim()}_${origin.state?.toLowerCase().trim()}_${origin.zip?.trim()}`;
    const destKey = `${destination.address?.toLowerCase().trim()}_${destination.city?.toLowerCase().trim()}_${destination.state?.toLowerCase().trim()}_${destination.zip?.trim()}`;
    
    if (originKey === destKey && originKey !== '___') {
      return { 
        isValid: false, 
        error: 'Origin and destination addresses cannot be the same' 
      };
    }

    return { isValid: true };
  }
}