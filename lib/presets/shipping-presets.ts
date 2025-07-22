// Shipping preset configurations for Task 5.3
// Provides 5 pre-configured B2B shipping scenarios

import { ShipmentDetails, ContactInfo, Address, PackageInfo, DeliveryPreferences } from '@/lib/types';

export interface ShippingPreset {
  id: string;
  name: string;
  description: string;
  category: 'manufacturing' | 'retail' | 'healthcare' | 'automotive' | 'technology' | 'legal';
  shipmentDetails: ShipmentDetails;
  isPopular?: boolean;
  estimatedSavings?: number; // Percentage time savings vs manual entry
}

export interface PresetSelectionState {
  selectedPresetId?: string;
  isModified: boolean;
  modifiedFields: string[];
}

console.log('📦 [SHIPPING-PRESETS] Loading preset configurations...');

// Default delivery preferences for all presets
const defaultDeliveryPreferences: DeliveryPreferences = {
  signatureRequired: true,
  adultSignatureRequired: false,
  smsConfirmation: false,
  photoProof: false,
  saturdayDelivery: false,
  holdAtLocation: false,
  serviceLevel: 'reliable'
};

export const SHIPPING_PRESETS: ShippingPreset[] = [
  {
    id: 'mfg-equipment-midwest-se',
    name: 'Manufacturing Equipment Shipment',
    description: 'Industrial equipment from Ohio to Georgia warehouse',
    category: 'manufacturing',
    isPopular: true,
    estimatedSavings: 75,
    shipmentDetails: {
      origin: {
        address: '1234 Industrial Blvd',
        suite: 'Bldg A',
        city: 'Columbus',
        state: 'OH',
        zip: '43215',
        country: 'US',
        isResidential: false,
        locationType: 'industrial',
        locationDescription: 'Manufacturing facility with loading dock',
        contactInfo: {
          name: 'John Smith',
          company: 'ABC Manufacturing Corp',
          phone: '(614) 555-0123',
          email: 'shipping@abcmfg.com',
          extension: '205'
        }
      },
      destination: {
        address: '5678 Commerce Way',
        suite: '',
        city: 'Atlanta',
        state: 'GA',
        zip: '30309',
        country: 'US',
        isResidential: false,
        locationType: 'warehouse',
        locationDescription: 'Distribution center with dock access',
        contactInfo: {
          name: 'Sarah Johnson',
          company: 'XYZ Distribution Center',
          phone: '(404) 555-0167',
          email: 'receiving@xyzdist.com',
          extension: ''
        }
      },
      package: {
        type: 'large',
        weight: { value: 85, unit: 'lbs' },
        dimensions: {
          length: 36,
          width: 24,
          height: 18,
          unit: 'in'
        },
        declaredValue: 3500,
        currency: 'USD',
        contents: 'Precision manufacturing tooling',
        contentsCategory: 'industrial',
        specialHandling: ['fragile', 'this-side-up']
      },
      deliveryPreferences: {
        ...defaultDeliveryPreferences,
        serviceLevel: 'reliable'
      }
    }
  },
  {
    id: 'medical-supplies-express',
    name: 'Medical Supplies - Priority',
    description: 'Urgent medical equipment to hospital',
    category: 'healthcare',
    estimatedSavings: 80,
    shipmentDetails: {
      origin: {
        address: '789 Medical Plaza Dr',
        suite: 'Suite 100',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        locationDescription: 'Medical supply distributor',
        contactInfo: {
          name: 'Dr. Michael Chen',
          company: 'MedSupply Distributors',
          phone: '(312) 555-0198',
          email: 'urgent@medsupply.com',
          extension: ''
        }
      },
      destination: {
        address: '321 Hospital Ave',
        suite: '',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        locationDescription: 'Hospital receiving department',
        contactInfo: {
          name: 'Lisa Rodriguez',
          company: 'Miami General Hospital',
          phone: '(305) 555-0245',
          email: 'receiving@miamigeneral.org',
          extension: ''
        }
      },
      package: {
        type: 'medium',
        weight: { value: 25, unit: 'lbs' },
        dimensions: {
          length: 18,
          width: 14,
          height: 10,
          unit: 'in'
        },
        declaredValue: 8500,
        currency: 'USD',
        contents: 'Sterile surgical instruments',
        contentsCategory: 'medical',
        specialHandling: ['temperature-controlled', 'fragile']
      },
      deliveryPreferences: {
        ...defaultDeliveryPreferences,
        serviceLevel: 'fastest',
        smsConfirmation: true
      }
    }
  },
  {
    id: 'tech-hardware-coast-to-coast',
    name: 'Technology Hardware Shipment',
    description: 'Server equipment from California to New York',
    category: 'technology',
    isPopular: true,
    estimatedSavings: 70,
    shipmentDetails: {
      origin: {
        address: '2468 Silicon Valley Blvd',
        suite: '',
        city: 'San Jose',
        state: 'CA',
        zip: '95110',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        locationDescription: 'Technology company warehouse',
        contactInfo: {
          name: 'Kevin Wong',
          company: 'TechCorp Systems',
          phone: '(408) 555-0134',
          email: 'logistics@techcorp.com',
          extension: ''
        }
      },
      destination: {
        address: '135 Broadway',
        suite: 'Floor 15',
        city: 'New York',
        state: 'NY',
        zip: '10006',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        locationDescription: 'Data center facility',
        contactInfo: {
          name: 'Amanda Foster',
          company: 'NYC Data Center',
          phone: '(212) 555-0289',
          email: 'intake@nycdatacenter.com',
          extension: ''
        }
      },
      package: {
        type: 'crate',
        weight: { value: 125, unit: 'lbs' },
        dimensions: {
          length: 48,
          width: 30,
          height: 24,
          unit: 'in'
        },
        declaredValue: 15000,
        currency: 'USD',
        contents: 'Rack-mounted server hardware',
        contentsCategory: 'electronics',
        specialHandling: ['fragile', 'this-side-up', 'white-glove']
      },
      deliveryPreferences: {
        ...defaultDeliveryPreferences,
        photoProof: true,
        serviceLevel: 'reliable'
      }
    }
  },
  {
    id: 'automotive-parts-regional',
    name: 'Automotive Parts Distribution',
    description: 'Auto parts from Michigan to Texas facility',
    category: 'automotive',
    estimatedSavings: 65,
    shipmentDetails: {
      origin: {
        address: '1357 Motor City Ave',
        suite: '',
        city: 'Detroit',
        state: 'MI',
        zip: '48201',
        country: 'US',
        isResidential: false,
        locationType: 'warehouse',
        locationDescription: 'Auto parts warehouse with loading dock',
        contactInfo: {
          name: 'Robert Taylor',
          company: 'AutoParts Plus',
          phone: '(313) 555-0156',
          email: 'shipping@autopartsplus.com',
          extension: ''
        }
      },
      destination: {
        address: '9876 Distribution Pkwy',
        suite: '',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        country: 'US',
        isResidential: false,
        locationType: 'warehouse',
        locationDescription: 'Regional distribution center',
        contactInfo: {
          name: 'Maria Gonzalez',
          company: 'Texas Auto Distribution',
          phone: '(214) 555-0187',
          email: 'receiving@texasauto.com',
          extension: ''
        }
      },
      package: {
        type: 'pallet',
        weight: { value: 350, unit: 'lbs' },
        dimensions: {
          length: 48,
          width: 40,
          height: 36,
          unit: 'in'
        },
        declaredValue: 2800,
        currency: 'USD',
        contents: 'Engine components and filters',
        contentsCategory: 'automotive',
        specialHandling: ['liftgate-pickup', 'liftgate-delivery']
      },
      deliveryPreferences: {
        ...defaultDeliveryPreferences,
        serviceLevel: 'economical'
      }
    }
  },
  {
    id: 'documents-legal-express',
    name: 'Legal Documents - Overnight',
    description: 'Urgent legal documents for court filing',
    category: 'legal',
    estimatedSavings: 85,
    shipmentDetails: {
      origin: {
        address: '555 Law Firm Plaza',
        suite: 'Suite 2500',
        city: 'Boston',
        state: 'MA',
        zip: '02101',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        locationDescription: 'Law firm office building',
        contactInfo: {
          name: 'Jennifer Adams',
          company: 'Adams & Associates Law',
          phone: '(617) 555-0123',
          email: 'urgent@adamslaw.com',
          extension: ''
        }
      },
      destination: {
        address: '100 Federal Courthouse',
        suite: '',
        city: 'Washington',
        state: 'DC',
        zip: '20001',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        locationDescription: 'Federal courthouse - clerk office',
        contactInfo: {
          name: 'Court Clerk',
          company: 'US District Court',
          phone: '(202) 555-0100',
          email: 'filings@dcdistrict.gov',
          extension: ''
        }
      },
      package: {
        type: 'envelope',
        weight: { value: 0.8, unit: 'lbs' },
        dimensions: {
          length: 12,
          width: 9,
          height: 1,
          unit: 'in'
        },
        declaredValue: 500,
        currency: 'USD',
        contents: 'Court filing documents',
        contentsCategory: 'documents',
        specialHandling: []
      },
      deliveryPreferences: {
        ...defaultDeliveryPreferences,
        adultSignatureRequired: true,
        smsConfirmation: true,
        serviceLevel: 'fastest'
      }
    }
  }
];

export function getPresetById(id: string): ShippingPreset | undefined {
  console.log('📦 [SHIPPING-PRESETS] Getting preset by ID:', id);
  const preset = SHIPPING_PRESETS.find(preset => preset.id === id);
  console.log('📦 [SHIPPING-PRESETS] Found preset:', preset ? preset.name : 'Not found');
  return preset;
}

export function getPresetsByCategory(category: ShippingPreset['category']): ShippingPreset[] {
  console.log('📦 [SHIPPING-PRESETS] Getting presets by category:', category);
  const presets = SHIPPING_PRESETS.filter(preset => preset.category === category);
  console.log('📦 [SHIPPING-PRESETS] Found presets:', presets.length);
  return presets;
}

export function getPopularPresets(): ShippingPreset[] {
  console.log('📦 [SHIPPING-PRESETS] Getting popular presets');
  const presets = SHIPPING_PRESETS.filter(preset => preset.isPopular);
  console.log('📦 [SHIPPING-PRESETS] Found popular presets:', presets.length);
  return presets;
}

export const PRESET_CATEGORIES = [
  { value: 'manufacturing', label: 'Manufacturing', description: 'Industrial equipment and supplies' },
  { value: 'healthcare', label: 'Healthcare', description: 'Medical equipment and supplies' },
  { value: 'technology', label: 'Technology', description: 'Computer hardware and electronics' },
  { value: 'automotive', label: 'Automotive', description: 'Auto parts and components' },
  { value: 'legal', label: 'Legal/Documents', description: 'Legal documents and papers' }
] as const;

console.log('📦 [SHIPPING-PRESETS] Loaded', SHIPPING_PRESETS.length, 'presets');