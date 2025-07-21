'use client';

import { useState, useEffect } from 'react';
import { HazmatDetails } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  FileCheck, 
  Phone, 
  Search, 
  Info,
  ShieldAlert,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface HazardClass {
  class: string;
  division?: string;
  description: string;
  examples: string[];
  packingGroups: ('I' | 'II' | 'III')[];
  restrictedServices: string[];
  additionalRequirements: string[];
  riskLevel: 'high' | 'extreme';
}

const hazardClasses: HazardClass[] = [
  {
    class: '1',
    description: 'Explosives',
    examples: ['Fireworks', 'Ammunition', 'Flares', 'Airbag inflators'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Air transport prohibited', 'Ground only'],
    additionalRequirements: ['ATF permits may be required', 'Quantity limitations'],
    riskLevel: 'extreme'
  },
  {
    class: '2',
    description: 'Gases (compressed, liquefied, dissolved)',
    examples: ['Propane', 'CO2 cartridges', 'Acetylene', 'Helium'],
    packingGroups: [],
    restrictedServices: ['Quantity limitations apply'],
    additionalRequirements: ['Pressure vessel certification', 'Temperature control'],
    riskLevel: 'high'
  },
  {
    class: '3',
    description: 'Flammable liquids',
    examples: ['Paint', 'Alcohol', 'Gasoline', 'Adhesives'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Ground only for Packing Group I'],
    additionalRequirements: ['Flame arrester caps', 'Vapor pressure limits'],
    riskLevel: 'high'
  },
  {
    class: '4',
    division: '4.1',
    description: 'Flammable solids',
    examples: ['Matches', 'Metal powders', 'Sulfur'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Air quantity limits'],
    additionalRequirements: ['Moisture protection', 'Static control'],
    riskLevel: 'high'
  },
  {
    class: '4',
    division: '4.2',
    description: 'Spontaneously combustible',
    examples: ['Charcoal', 'Oily rags', 'White phosphorus'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Special packaging required'],
    additionalRequirements: ['Inert atmosphere', 'Temperature monitoring'],
    riskLevel: 'extreme'
  },
  {
    class: '4',
    division: '4.3',
    description: 'Dangerous when wet',
    examples: ['Sodium', 'Calcium carbide', 'Magnesium'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Moisture-proof packaging mandatory'],
    additionalRequirements: ['Waterproof containers', 'Desiccants'],
    riskLevel: 'extreme'
  },
  {
    class: '5',
    division: '5.1',
    description: 'Oxidizers',
    examples: ['Hydrogen peroxide', 'Pool chemicals', 'Fertilizers'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Separation requirements'],
    additionalRequirements: ['Contamination prevention', 'Compatible packaging'],
    riskLevel: 'high'
  },
  {
    class: '5',
    division: '5.2',
    description: 'Organic peroxides',
    examples: ['Benzoyl peroxide', 'Cumene hydroperoxide'],
    packingGroups: [],
    restrictedServices: ['Temperature control required', 'Quantity limits'],
    additionalRequirements: ['Refrigeration', 'Self-reactive monitoring'],
    riskLevel: 'extreme'
  },
  {
    class: '6',
    division: '6.1',
    description: 'Toxic substances',
    examples: ['Pesticides', 'Medical waste', 'Cyanides'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Air transport restrictions'],
    additionalRequirements: ['Poison control contact', 'Antidote information'],
    riskLevel: 'extreme'
  },
  {
    class: '6',
    division: '6.2',
    description: 'Infectious substances',
    examples: ['Medical specimens', 'Diagnostic samples', 'Vaccines'],
    packingGroups: [],
    restrictedServices: ['Special training required', 'Chain of custody'],
    additionalRequirements: ['Triple packaging', 'Category A/B classification'],
    riskLevel: 'extreme'
  },
  {
    class: '7',
    description: 'Radioactive materials',
    examples: ['Medical isotopes', 'Uranium', 'Thorium'],
    packingGroups: [],
    restrictedServices: ['NRC authorization required'],
    additionalRequirements: ['Radiation safety officer', 'Transport index'],
    riskLevel: 'extreme'
  },
  {
    class: '8',
    description: 'Corrosive substances',
    examples: ['Battery acid', 'Caustic soda', 'Cleaning agents'],
    packingGroups: ['I', 'II', 'III'],
    restrictedServices: ['Leak-proof packaging mandatory'],
    additionalRequirements: ['Neutralizing agent', 'Corrosion-resistant containers'],
    riskLevel: 'high'
  },
  {
    class: '9',
    description: 'Miscellaneous dangerous goods',
    examples: ['Lithium batteries', 'Dry ice', 'Magnetized materials'],
    packingGroups: ['II', 'III'],
    restrictedServices: ['Varies by substance'],
    additionalRequirements: ['Substance-specific requirements'],
    riskLevel: 'high'
  }
];

// Mock UN proper shipping names (subset for demonstration)
const commonShippingNames = [
  'Acetone',
  'Aerosols, flammable',
  'Alcohol, n.o.s.',
  'Batteries, lithium ion',
  'Batteries, lithium metal',
  'Carbon dioxide, solid (dry ice)',
  'Corrosive liquid, n.o.s.',
  'Flammable liquid, n.o.s.',
  'Gasoline',
  'Hydrogen peroxide, aqueous solution',
  'Isopropanol',
  'Magnetized material',
  'Paint',
  'Perfumery products',
  'Toxic liquid, n.o.s.'
];

interface HazmatDetailsFormProps {
  value: HazmatDetails | null;
  onChange: (details: HazmatDetails | null) => void;
  isRequired: boolean;
  className?: string;
}

export function HazmatDetailsForm({
  value,
  onChange,
  isRequired,
  className
}: HazmatDetailsFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNames, setFilteredNames] = useState(commonShippingNames);
  const [selectedClass, setSelectedClass] = useState<HazardClass | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [complianceCheck, setComplianceCheck] = useState<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
  }>({ isValid: false, issues: [], warnings: [] });

  console.log('[HazmatDetailsForm] Rendering with:', {
    value,
    isRequired,
    selectedClass: selectedClass?.class,
    validationErrors
  });

  useEffect(() => {
    if (searchQuery) {
      const filtered = commonShippingNames.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNames(filtered);
    } else {
      setFilteredNames(commonShippingNames);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (value?.hazardClass) {
      const hazardClass = hazardClasses.find(hc => 
        hc.class === value.hazardClass || 
        (hc.division && hc.division === value.hazardClass)
      );
      setSelectedClass(hazardClass || null);
    }
  }, [value?.hazardClass]);

  useEffect(() => {
    // Perform compliance validation
    if (value) {
      const errors: Record<string, string> = {};
      const issues: string[] = [];
      const warnings: string[] = [];

      // Validate UN Number
      if (!value.unNumber || !/^UN\d{4}$/.test(value.unNumber)) {
        errors.unNumber = 'UN Number must be in format UN#### (e.g., UN1234)';
        issues.push('Invalid UN Number format');
      }

      // Validate proper shipping name
      if (!value.properShippingName || value.properShippingName.length < 3) {
        errors.properShippingName = 'Proper shipping name is required';
        issues.push('Missing proper shipping name');
      }

      // Validate hazard class
      if (!value.hazardClass) {
        errors.hazardClass = 'Hazard class is required';
        issues.push('Missing hazard class');
      }

      // Validate packing group compatibility
      if (value.packingGroup && selectedClass) {
        if (selectedClass.packingGroups.length > 0 && !selectedClass.packingGroups.includes(value.packingGroup)) {
          errors.packingGroup = `Packing Group ${value.packingGroup} not valid for this hazard class`;
          issues.push('Invalid packing group for selected hazard class');
        }
      }

      // Validate emergency contact
      if (!value.emergencyContact || !/^\+?[\d\s\-\(\)]{10,}$/.test(value.emergencyContact)) {
        errors.emergencyContact = '24/7 emergency contact phone number required';
        issues.push('Invalid emergency contact number');
      }

      // Check for warnings
      if (selectedClass?.riskLevel === 'extreme') {
        warnings.push('Extreme risk classification - additional documentation may be required');
      }

      if (selectedClass && selectedClass.restrictedServices && selectedClass.restrictedServices.length > 0) {
        warnings.push(`Service restrictions apply: ${selectedClass.restrictedServices.join(', ')}`);
      }

      setValidationErrors(errors);
      setComplianceCheck({
        isValid: Object.keys(errors).length === 0 && issues.length === 0,
        issues,
        warnings
      });
    } else {
      setValidationErrors({});
      setComplianceCheck({ isValid: false, issues: [], warnings: [] });
    }
  }, [value, selectedClass]);

  const handleFieldChange = (field: keyof HazmatDetails, fieldValue: any) => {
    if (!value) {
      // Initialize new hazmat details
      const newDetails: HazmatDetails = {
        unNumber: '',
        properShippingName: '',
        hazardClass: '3',
        packingGroup: 'III',
        totalQuantity: 1,
        quantityUnit: 'kg',
        emergencyContact: ''
      };
      onChange({ ...newDetails, [field]: fieldValue });
    } else {
      onChange({ ...value, [field]: fieldValue });
    }
    
    console.log('[HazmatDetailsForm] Field changed:', { field, value: fieldValue });
  };

  const clearHazmatDetails = () => {
    onChange(null);
    setSelectedClass(null);
    console.log('[HazmatDetailsForm] Hazmat details cleared');
  };

  if (!isRequired && !value) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Hazardous Materials Declaration
          </h3>
          {complianceCheck.isValid && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Compliant
            </Badge>
          )}
        </div>
        {value && !isRequired && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearHazmatDetails}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Remove Hazmat
          </Button>
        )}
      </div>

      <Alert className="border-red-200 bg-red-50">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Regulatory Compliance Required:</strong> Accurate classification and documentation 
          are mandatory for dangerous goods transport. Incorrect declarations may result in fines, 
          delays, or shipment rejection.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UN Number */}
        <div>
          <Label htmlFor="unNumber" className="text-sm font-medium text-gray-700">
            UN Number *
          </Label>
          <Input
            id="unNumber"
            placeholder="UN1234"
            value={value?.unNumber || ''}
            onChange={(e) => handleFieldChange('unNumber', e.target.value.toUpperCase())}
            className={cn(validationErrors.unNumber && 'border-red-300')}
          />
          {validationErrors.unNumber && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.unNumber}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Four-digit UN identification number (e.g., UN1203 for gasoline)
          </p>
        </div>

        {/* Proper Shipping Name */}
        <div>
          <Label htmlFor="properShippingName" className="text-sm font-medium text-gray-700">
            Proper Shipping Name *
          </Label>
          <div className="relative">
            <Input
              id="properShippingName"
              placeholder="Search or enter shipping name"
              value={value?.properShippingName || searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFieldChange('properShippingName', e.target.value);
              }}
              className={cn(validationErrors.properShippingName && 'border-red-300')}
            />
            <Search className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
          </div>
          {searchQuery && filteredNames.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-sm">
              {filteredNames.slice(0, 10).map((name) => (
                <button
                  key={name}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-blue-50"
                  onClick={() => {
                    handleFieldChange('properShippingName', name);
                    setSearchQuery('');
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {validationErrors.properShippingName && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.properShippingName}</p>
          )}
        </div>

        {/* Hazard Class */}
        <div>
          <Label htmlFor="hazardClass" className="text-sm font-medium text-gray-700">
            Hazard Class *
          </Label>
          <Select
            value={value?.hazardClass || ''}
            onValueChange={(classValue) => handleFieldChange('hazardClass', classValue)}
          >
            <SelectTrigger className={cn(validationErrors.hazardClass && 'border-red-300')}>
              <SelectValue placeholder="Select hazard class" />
            </SelectTrigger>
            <SelectContent>
              {hazardClasses.map((hc) => (
                <SelectItem 
                  key={hc.division || hc.class} 
                  value={hc.division || hc.class}
                >
                  Class {hc.division || hc.class}: {hc.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.hazardClass && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.hazardClass}</p>
          )}
        </div>

        {/* Packing Group */}
        {selectedClass && selectedClass.packingGroups.length > 0 && (
          <div>
            <Label htmlFor="packingGroup" className="text-sm font-medium text-gray-700">
              Packing Group *
            </Label>
            <Select
              value={value?.packingGroup || ''}
              onValueChange={(group) => handleFieldChange('packingGroup', group)}
            >
              <SelectTrigger className={cn(validationErrors.packingGroup && 'border-red-300')}>
                <SelectValue placeholder="Select packing group" />
              </SelectTrigger>
              <SelectContent>
                {selectedClass.packingGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    Packing Group {group} - {
                      group === 'I' ? 'High Danger' :
                      group === 'II' ? 'Medium Danger' :
                      'Low Danger'
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.packingGroup && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.packingGroup}</p>
            )}
          </div>
        )}

        {/* Total Quantity */}
        <div>
          <Label htmlFor="totalQuantity" className="text-sm font-medium text-gray-700">
            Total Quantity *
          </Label>
          <div className="flex space-x-2">
            <Input
              id="totalQuantity"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="1.0"
              value={value?.totalQuantity || ''}
              onChange={(e) => handleFieldChange('totalQuantity', parseFloat(e.target.value) || 0)}
              className="flex-1"
            />
            <Select
              value={value?.quantityUnit || 'kg'}
              onValueChange={(unit) => handleFieldChange('quantityUnit', unit)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="pieces">pcs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">
            24/7 Emergency Contact *
          </Label>
          <Input
            id="emergencyContact"
            type="tel"
            placeholder="+1-800-555-0123"
            value={value?.emergencyContact || ''}
            onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
            className={cn(validationErrors.emergencyContact && 'border-red-300')}
          />
          {validationErrors.emergencyContact && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.emergencyContact}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Must be available 24/7 for emergency response information
          </p>
        </div>
      </div>

      {/* Hazard Class Information */}
      {selectedClass && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Class {selectedClass.division || selectedClass.class} Requirements
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-yellow-900 mb-2">Examples</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                {selectedClass.examples.map((example, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-1 h-1 bg-yellow-600 rounded-full mr-2"></div>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-yellow-900 mb-2">Additional Requirements</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                {selectedClass.additionalRequirements.map((req, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-1 h-1 bg-yellow-600 rounded-full mr-2"></div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {selectedClass.restrictedServices.length > 0 && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <Truck className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Service Restrictions:</strong> {selectedClass.restrictedServices.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Compliance Status */}
      {(complianceCheck.issues.length > 0 || complianceCheck.warnings.length > 0) && (
        <div className="space-y-3">
          {complianceCheck.issues.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Compliance Issues:</strong>
                <ul className="mt-2 space-y-1">
                  {complianceCheck.issues.map((issue, index) => (
                    <li key={index} className="text-sm">• {issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {complianceCheck.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important Notices:</strong>
                <ul className="mt-2 space-y-1">
                  {complianceCheck.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
