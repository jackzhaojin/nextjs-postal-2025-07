import { 
  FormConfig, 
  PackageType, 
  SpecialHandlingOption, 
  Country, 
  Industry,
  ValidationSection,
  DeliveryPreference,
  ServiceLevelPreference,
  PaymentMethod,
  Currency
} from '../schemas/form-config-schemas';

// Package Types Configuration
export const packageTypes: PackageType[] = [
  {
    id: 'envelope',
    name: 'Envelope/Document',
    description: 'Letters, documents, and small flat items',
    weight: { min: 0.1, max: 1, unit: 'lbs' },
    dimensions: { maxLength: 12, maxWidth: 9, maxHeight: 0.5, unit: 'in' },
    pricing: { baseMultiplier: 1.0, handlingFee: 0 },
    restrictions: ['No fragile items', 'No liquids', 'Documents only'],
    examples: ['Legal documents', 'Contracts', 'Certificates', 'Letters']
  },
  {
    id: 'small',
    name: 'Small Package',
    description: 'Small boxes and packages for everyday items',
    weight: { min: 0.1, max: 50, unit: 'lbs' },
    dimensions: { maxLength: 24, maxWidth: 18, maxHeight: 12, unit: 'in' },
    pricing: { baseMultiplier: 1.0, handlingFee: 0 },
    restrictions: ['Standard packaging required'],
    examples: ['Books', 'Small electronics', 'Clothing', 'Parts']
  },
  {
    id: 'medium',
    name: 'Medium Package',
    description: 'Medium-sized packages for business equipment',
    weight: { min: 0.1, max: 150, unit: 'lbs' },
    dimensions: { maxLength: 36, maxWidth: 24, maxHeight: 18, unit: 'in' },
    pricing: { baseMultiplier: 1.2, handlingFee: 5 },
    restrictions: ['Proper packaging required', 'May require special handling'],
    examples: ['Computer equipment', 'Small appliances', 'Tools', 'Office supplies']
  },
  {
    id: 'large',
    name: 'Large Package',
    description: 'Large packages for industrial equipment',
    weight: { min: 0.1, max: 500, unit: 'lbs' },
    dimensions: { maxLength: 48, maxWidth: 36, maxHeight: 24, unit: 'in' },
    pricing: { baseMultiplier: 1.5, handlingFee: 15 },
    restrictions: ['Industrial packaging required', 'May require freight service'],
    examples: ['Industrial equipment', 'Large appliances', 'Machinery parts']
  },
  {
    id: 'pallet',
    name: 'Pallet',
    description: 'Palletized freight for bulk shipments',
    weight: { min: 150, max: 2500, unit: 'lbs' },
    dimensions: { maxLength: 96, maxWidth: 48, maxHeight: 72, unit: 'in' },
    pricing: { baseMultiplier: 2.0, handlingFee: 50 },
    restrictions: ['Standard pallet required', 'Forklift access needed', 'LTL freight service'],
    examples: ['Bulk materials', 'Multiple boxes', 'Heavy machinery']
  },
  {
    id: 'crate',
    name: 'Crate/Custom Packaging',
    description: 'Custom crated items requiring special handling',
    weight: { min: 0.1, max: 5000, unit: 'lbs' },
    dimensions: { maxLength: 120, maxWidth: 96, maxHeight: 96, unit: 'in' },
    pricing: { baseMultiplier: 2.5, handlingFee: 100 },
    restrictions: ['Custom crating required', 'Special handling equipment', 'Advance notice required'],
    examples: ['Artwork', 'Fragile machinery', 'Oversized equipment']
  },
  {
    id: 'multiple',
    name: 'Multiple Pieces',
    description: 'Multiple packages shipped together',
    weight: { min: 0.1, max: 10000, unit: 'lbs' },
    dimensions: { maxLength: 999, maxWidth: 999, maxHeight: 999, unit: 'in' },
    pricing: { baseMultiplier: 1.1, handlingFee: 10 },
    restrictions: ['Each piece must be properly labeled', 'Consolidation recommended'],
    examples: ['Multiple boxes', 'Component sets', 'Bulk orders']
  }
];

// Special Handling Options
export const specialHandling: SpecialHandlingOption[] = [
  {
    id: 'fragile',
    name: 'Fragile/Handle with Care',
    description: 'Extra care handling for fragile items with special packaging',
    fee: 15,
    currency: 'USD',
    requirements: ['Fragile stickers applied', 'Extra padding required', 'Careful loading'],
    incompatibleWith: [],
    triggersForm: false
  },
  {
    id: 'this-side-up',
    name: 'This Side Up',
    description: 'Orientation-sensitive items that must remain upright',
    fee: 5,
    currency: 'USD',
    requirements: ['Orientation labels applied', 'Special loading procedures'],
    incompatibleWith: [],
    triggersForm: false
  },
  {
    id: 'temperature-controlled',
    name: 'Temperature Controlled',
    description: 'Climate-controlled transport for temperature-sensitive items',
    fee: 75,
    currency: 'USD',
    requirements: ['Temperature monitoring', 'Insulated packaging', 'Refrigerated transport'],
    incompatibleWith: ['hazardous'],
    triggersForm: false
  },
  {
    id: 'hazardous',
    name: 'Hazardous Materials',
    description: 'Dangerous goods requiring special documentation and handling',
    fee: 50,
    currency: 'USD',
    requirements: ['HAZMAT certification', 'Special documentation', 'Trained handlers'],
    incompatibleWith: ['temperature-controlled'],
    triggersForm: true
  },
  {
    id: 'white-glove',
    name: 'White Glove Service',
    description: 'Premium delivery service with setup and debris removal',
    fee: 125,
    currency: 'USD',
    requirements: ['Appointment scheduling', 'Inside delivery', 'Setup service'],
    incompatibleWith: [],
    triggersForm: false
  },
  {
    id: 'inside-delivery',
    name: 'Inside Delivery',
    description: 'Delivery beyond the first threshold or loading dock',
    fee: 45,
    currency: 'USD',
    requirements: ['Access to interior', 'Clear pathway', 'Additional time'],
    incompatibleWith: [],
    triggersForm: false
  },
  {
    id: 'liftgate-pickup',
    name: 'Liftgate Required at Pickup',
    description: 'Hydraulic liftgate service for ground-level pickup',
    fee: 35,
    currency: 'USD',
    requirements: ['Ground-level access', 'Adequate space for truck'],
    incompatibleWith: [],
    triggersForm: false
  },
  {
    id: 'liftgate-delivery',
    name: 'Liftgate Required at Delivery',
    description: 'Hydraulic liftgate service for ground-level delivery',
    fee: 35,
    currency: 'USD',
    requirements: ['Ground-level access', 'Adequate space for truck'],
    incompatibleWith: [],
    triggersForm: false
  }
];

// Countries and Geographic Data
export const countries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    zipPattern: '^\\d{5}(-\\d{4})?$',
    zipLabel: 'ZIP Code',
    phonePattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
    states: [
      { code: 'AL', name: 'Alabama', fullName: 'Alabama', zipPattern: '^3[0-6]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'AK', name: 'Alaska', fullName: 'Alaska', zipPattern: '^99\\d{3}$', timeZone: 'America/Anchorage' },
      { code: 'AZ', name: 'Arizona', fullName: 'Arizona', zipPattern: '^8[5-6]\\d{3}$', timeZone: 'America/Phoenix' },
      { code: 'AR', name: 'Arkansas', fullName: 'Arkansas', zipPattern: '^7[1-2]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'CA', name: 'California', fullName: 'California', zipPattern: '^9[0-6]\\d{3}$', timeZone: 'America/Los_Angeles' },
      { code: 'CO', name: 'Colorado', fullName: 'Colorado', zipPattern: '^8[0-1]\\d{3}$', timeZone: 'America/Denver' },
      { code: 'CT', name: 'Connecticut', fullName: 'Connecticut', zipPattern: '^0[6-7]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'DE', name: 'Delaware', fullName: 'Delaware', zipPattern: '^19\\d{3}$', timeZone: 'America/New_York' },
      { code: 'FL', name: 'Florida', fullName: 'Florida', zipPattern: '^3[2-4]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'GA', name: 'Georgia', fullName: 'Georgia', zipPattern: '^3[0-1]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'HI', name: 'Hawaii', fullName: 'Hawaii', zipPattern: '^96\\d{3}$', timeZone: 'Pacific/Honolulu' },
      { code: 'ID', name: 'Idaho', fullName: 'Idaho', zipPattern: '^83\\d{3}$', timeZone: 'America/Boise' },
      { code: 'IL', name: 'Illinois', fullName: 'Illinois', zipPattern: '^6[0-2]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'IN', name: 'Indiana', fullName: 'Indiana', zipPattern: '^4[6-7]\\d{3}$', timeZone: 'America/Indiana/Indianapolis' },
      { code: 'IA', name: 'Iowa', fullName: 'Iowa', zipPattern: '^5[0-2]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'KS', name: 'Kansas', fullName: 'Kansas', zipPattern: '^6[6-7]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'KY', name: 'Kentucky', fullName: 'Kentucky', zipPattern: '^4[0-2]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'LA', name: 'Louisiana', fullName: 'Louisiana', zipPattern: '^70\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'ME', name: 'Maine', fullName: 'Maine', zipPattern: '^04\\d{3}$', timeZone: 'America/New_York' },
      { code: 'MD', name: 'Maryland', fullName: 'Maryland', zipPattern: '^2[0-1]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'MA', name: 'Massachusetts', fullName: 'Massachusetts', zipPattern: '^0[1-2]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'MI', name: 'Michigan', fullName: 'Michigan', zipPattern: '^4[8-9]\\d{3}$', timeZone: 'America/Detroit' },
      { code: 'MN', name: 'Minnesota', fullName: 'Minnesota', zipPattern: '^5[5-6]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'MS', name: 'Mississippi', fullName: 'Mississippi', zipPattern: '^39\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'MO', name: 'Missouri', fullName: 'Missouri', zipPattern: '^6[3-5]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'MT', name: 'Montana', fullName: 'Montana', zipPattern: '^59\\d{3}$', timeZone: 'America/Denver' },
      { code: 'NE', name: 'Nebraska', fullName: 'Nebraska', zipPattern: '^6[8-9]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'NV', name: 'Nevada', fullName: 'Nevada', zipPattern: '^89\\d{3}$', timeZone: 'America/Los_Angeles' },
      { code: 'NH', name: 'New Hampshire', fullName: 'New Hampshire', zipPattern: '^03\\d{3}$', timeZone: 'America/New_York' },
      { code: 'NJ', name: 'New Jersey', fullName: 'New Jersey', zipPattern: '^0[7-8]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'NM', name: 'New Mexico', fullName: 'New Mexico', zipPattern: '^8[7-8]\\d{3}$', timeZone: 'America/Denver' },
      { code: 'NY', name: 'New York', fullName: 'New York', zipPattern: '^1[0-4]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'NC', name: 'North Carolina', fullName: 'North Carolina', zipPattern: '^2[7-8]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'ND', name: 'North Dakota', fullName: 'North Dakota', zipPattern: '^58\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'OH', name: 'Ohio', fullName: 'Ohio', zipPattern: '^4[3-5]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'OK', name: 'Oklahoma', fullName: 'Oklahoma', zipPattern: '^7[3-4]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'OR', name: 'Oregon', fullName: 'Oregon', zipPattern: '^97\\d{3}$', timeZone: 'America/Los_Angeles' },
      { code: 'PA', name: 'Pennsylvania', fullName: 'Pennsylvania', zipPattern: '^1[5-9]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'RI', name: 'Rhode Island', fullName: 'Rhode Island', zipPattern: '^02\\d{3}$', timeZone: 'America/New_York' },
      { code: 'SC', name: 'South Carolina', fullName: 'South Carolina', zipPattern: '^29\\d{3}$', timeZone: 'America/New_York' },
      { code: 'SD', name: 'South Dakota', fullName: 'South Dakota', zipPattern: '^57\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'TN', name: 'Tennessee', fullName: 'Tennessee', zipPattern: '^3[7-8]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'TX', name: 'Texas', fullName: 'Texas', zipPattern: '^7[5-9]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'UT', name: 'Utah', fullName: 'Utah', zipPattern: '^84\\d{3}$', timeZone: 'America/Denver' },
      { code: 'VT', name: 'Vermont', fullName: 'Vermont', zipPattern: '^05\\d{3}$', timeZone: 'America/New_York' },
      { code: 'VA', name: 'Virginia', fullName: 'Virginia', zipPattern: '^2[2-4]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'WA', name: 'Washington', fullName: 'Washington', zipPattern: '^98\\d{3}$', timeZone: 'America/Los_Angeles' },
      { code: 'WV', name: 'West Virginia', fullName: 'West Virginia', zipPattern: '^2[4-6]\\d{3}$', timeZone: 'America/New_York' },
      { code: 'WI', name: 'Wisconsin', fullName: 'Wisconsin', zipPattern: '^5[3-5]\\d{3}$', timeZone: 'America/Chicago' },
      { code: 'WY', name: 'Wyoming', fullName: 'Wyoming', zipPattern: '^82\\d{3}$', timeZone: 'America/Denver' }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    zipPattern: '^[A-Za-z]\\d[A-Za-z] \\d[A-Za-z]\\d$',
    zipLabel: 'Postal Code',
    phonePattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
    provinces: [
      { code: 'AB', name: 'Alberta', fullName: 'Alberta', zipPattern: '^T\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Edmonton' },
      { code: 'BC', name: 'British Columbia', fullName: 'British Columbia', zipPattern: '^V\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Vancouver' },
      { code: 'MB', name: 'Manitoba', fullName: 'Manitoba', zipPattern: '^R\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Winnipeg' },
      { code: 'NB', name: 'New Brunswick', fullName: 'New Brunswick', zipPattern: '^E\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Moncton' },
      { code: 'NL', name: 'Newfoundland and Labrador', fullName: 'Newfoundland and Labrador', zipPattern: '^A\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/St_Johns' },
      { code: 'NS', name: 'Nova Scotia', fullName: 'Nova Scotia', zipPattern: '^B\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Halifax' },
      { code: 'NT', name: 'Northwest Territories', fullName: 'Northwest Territories', zipPattern: '^X\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Yellowknife' },
      { code: 'NU', name: 'Nunavut', fullName: 'Nunavut', zipPattern: '^X\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Iqaluit' },
      { code: 'ON', name: 'Ontario', fullName: 'Ontario', zipPattern: '^[KLM]\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Toronto' },
      { code: 'PE', name: 'Prince Edward Island', fullName: 'Prince Edward Island', zipPattern: '^C\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Halifax' },
      { code: 'QC', name: 'Quebec', fullName: 'Québec', zipPattern: '^[GHJ]\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Montreal' },
      { code: 'SK', name: 'Saskatchewan', fullName: 'Saskatchewan', zipPattern: '^S\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Regina' },
      { code: 'YT', name: 'Yukon', fullName: 'Yukon', zipPattern: '^Y\\d[A-Za-z] \\d[A-Za-z]\\d$', timeZone: 'America/Whitehorse' }
    ]
  },
  {
    code: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    zipPattern: '^\\d{5}$',
    zipLabel: 'Código Postal',
    phonePattern: '^\\(?([0-9]{2,3})\\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{4})$',
    states: [
      { code: 'AGU', name: 'Aguascalientes', fullName: 'Aguascalientes', zipPattern: '^20\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'BCN', name: 'Baja California', fullName: 'Baja California', zipPattern: '^2[1-2]\\d{3}$', timeZone: 'America/Tijuana' },
      { code: 'BCS', name: 'Baja California Sur', fullName: 'Baja California Sur', zipPattern: '^23\\d{3}$', timeZone: 'America/Mazatlan' },
      { code: 'CAM', name: 'Campeche', fullName: 'Campeche', zipPattern: '^24\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'CHP', name: 'Chiapas', fullName: 'Chiapas', zipPattern: '^2[9-3]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'CHH', name: 'Chihuahua', fullName: 'Chihuahua', zipPattern: '^3[1-3]\\d{3}$', timeZone: 'America/Chihuahua' },
      { code: 'COA', name: 'Coahuila', fullName: 'Coahuila de Zaragoza', zipPattern: '^2[5-7]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'COL', name: 'Colima', fullName: 'Colima', zipPattern: '^28\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'DIF', name: 'Mexico City', fullName: 'Ciudad de México', zipPattern: '^0[1-9]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'DUR', name: 'Durango', fullName: 'Durango', zipPattern: '^34\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'GUA', name: 'Guanajuato', fullName: 'Guanajuato', zipPattern: '^3[6-8]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'GRO', name: 'Guerrero', fullName: 'Guerrero', zipPattern: '^39\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'HID', name: 'Hidalgo', fullName: 'Hidalgo', zipPattern: '^4[2-3]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'JAL', name: 'Jalisco', fullName: 'Jalisco', zipPattern: '^4[4-5]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'MEX', name: 'México', fullName: 'Estado de México', zipPattern: '^5[0-7]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'MIC', name: 'Michoacán', fullName: 'Michoacán de Ocampo', zipPattern: '^5[8-6]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'MOR', name: 'Morelos', fullName: 'Morelos', zipPattern: '^62\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'NAY', name: 'Nayarit', fullName: 'Nayarit', zipPattern: '^63\\d{3}$', timeZone: 'America/Mazatlan' },
      { code: 'NLE', name: 'Nuevo León', fullName: 'Nuevo León', zipPattern: '^6[4-7]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'OAX', name: 'Oaxaca', fullName: 'Oaxaca', zipPattern: '^6[8-7]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'PUE', name: 'Puebla', fullName: 'Puebla', zipPattern: '^7[2-5]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'QUE', name: 'Querétaro', fullName: 'Querétaro', zipPattern: '^76\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'ROO', name: 'Quintana Roo', fullName: 'Quintana Roo', zipPattern: '^77\\d{3}$', timeZone: 'America/Cancun' },
      { code: 'SLP', name: 'San Luis Potosí', fullName: 'San Luis Potosí', zipPattern: '^7[8-9]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'SIN', name: 'Sinaloa', fullName: 'Sinaloa', zipPattern: '^8[0-2]\\d{3}$', timeZone: 'America/Mazatlan' },
      { code: 'SON', name: 'Sonora', fullName: 'Sonora', zipPattern: '^8[3-5]\\d{3}$', timeZone: 'America/Hermosillo' },
      { code: 'TAB', name: 'Tabasco', fullName: 'Tabasco', zipPattern: '^86\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'TAM', name: 'Tamaulipas', fullName: 'Tamaulipas', zipPattern: '^8[7-9]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'TLA', name: 'Tlaxcala', fullName: 'Tlaxcala', zipPattern: '^90\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'VER', name: 'Veracruz', fullName: 'Veracruz de Ignacio de la Llave', zipPattern: '^9[1-6]\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'YUC', name: 'Yucatán', fullName: 'Yucatán', zipPattern: '^97\\d{3}$', timeZone: 'America/Mexico_City' },
      { code: 'ZAC', name: 'Zacatecas', fullName: 'Zacatecas', zipPattern: '^98\\d{3}$', timeZone: 'America/Mexico_City' }
    ]
  }
];

// Industry Classifications
export const industries: Industry[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial manufacturing and production facilities',
    category: 'Industrial',
    specialRequirements: ['Heavy machinery handling', 'Industrial packaging'],
    riskLevel: 'medium'
  },
  {
    id: 'retail-ecommerce',
    name: 'Retail/E-commerce',
    description: 'Retail stores and online commerce businesses',
    category: 'Commercial',
    specialRequirements: ['Consumer packaging', 'High volume processing'],
    riskLevel: 'low'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical facilities, hospitals, and healthcare providers',
    category: 'Professional',
    specialRequirements: ['Temperature control', 'Secure handling', 'Chain of custody'],
    riskLevel: 'high'
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Technology companies and software development',
    category: 'Professional',
    specialRequirements: ['Electronic device handling', 'Static protection'],
    riskLevel: 'medium'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Automotive industry and vehicle manufacturing',
    category: 'Industrial',
    specialRequirements: ['Heavy parts handling', 'Precision components'],
    riskLevel: 'medium'
  },
  {
    id: 'aerospace',
    name: 'Aerospace',
    description: 'Aerospace and defense industry',
    category: 'Industrial',
    specialRequirements: ['Precision handling', 'Security clearance', 'Export compliance'],
    riskLevel: 'high'
  },
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    description: 'Food processing and beverage industry',
    category: 'Commercial',
    specialRequirements: ['Temperature control', 'Food safety compliance'],
    riskLevel: 'medium'
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    description: 'Pharmaceutical and biotechnology companies',
    category: 'Professional',
    specialRequirements: ['Temperature control', 'Chain of custody', 'Regulatory compliance'],
    riskLevel: 'high'
  },
  {
    id: 'chemicals',
    name: 'Chemicals',
    description: 'Chemical manufacturing and distribution',
    category: 'Industrial',
    specialRequirements: ['Hazmat handling', 'Special permits', 'Safety protocols'],
    riskLevel: 'high'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronics manufacturing and distribution',
    category: 'Industrial',
    specialRequirements: ['Static protection', 'Fragile handling'],
    riskLevel: 'medium'
  },
  {
    id: 'textiles',
    name: 'Textiles',
    description: 'Textile and apparel industry',
    category: 'Commercial',
    specialRequirements: ['Moisture protection', 'Bulk handling'],
    riskLevel: 'low'
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Construction and building materials',
    category: 'Industrial',
    specialRequirements: ['Heavy materials', 'Job site delivery'],
    riskLevel: 'medium'
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Energy sector including oil, gas, and renewables',
    category: 'Industrial',
    specialRequirements: ['Hazmat handling', 'Heavy equipment', 'Remote locations'],
    riskLevel: 'high'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Agricultural and farming operations',
    category: 'Commercial',
    specialRequirements: ['Seasonal shipping', 'Temperature control'],
    riskLevel: 'low'
  },
  {
    id: 'mining',
    name: 'Mining',
    description: 'Mining and extraction industries',
    category: 'Industrial',
    specialRequirements: ['Heavy equipment', 'Remote locations', 'Special permits'],
    riskLevel: 'high'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Transportation and logistics companies',
    category: 'Commercial',
    specialRequirements: ['High volume', 'Cross-docking'],
    riskLevel: 'low'
  },
  {
    id: 'financial',
    name: 'Financial Services',
    description: 'Banks, insurance, and financial institutions',
    category: 'Professional',
    specialRequirements: ['Secure handling', 'Document protection'],
    riskLevel: 'medium'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Schools, universities, and educational institutions',
    category: 'Professional',
    specialRequirements: ['Bulk deliveries', 'Schedule coordination'],
    riskLevel: 'low'
  },
  {
    id: 'government',
    name: 'Government',
    description: 'Government agencies and public sector',
    category: 'Professional',
    specialRequirements: ['Security clearance', 'Compliance tracking'],
    riskLevel: 'high'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Entertainment and media industry',
    category: 'Commercial',
    specialRequirements: ['Fragile handling', 'Time-sensitive delivery'],
    riskLevel: 'medium'
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Law firms and legal services',
    category: 'Professional',
    specialRequirements: ['Confidential handling', 'Chain of custody'],
    riskLevel: 'medium'
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Real estate and property management',
    category: 'Commercial',
    specialRequirements: ['Document handling', 'Time-sensitive delivery'],
    riskLevel: 'low'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other industries not listed above',
    category: 'General',
    specialRequirements: ['Standard handling'],
    riskLevel: 'low'
  }
];

// Validation Rules
export const validationRules: ValidationSection[] = [
  {
    section: 'shipmentDetails',
    rules: [
      {
        field: 'origin.address',
        type: 'required',
        message: 'Origin address is required'
      },
      {
        field: 'destination.address',
        type: 'required',
        message: 'Destination address is required'
      },
      {
        field: 'origin',
        type: 'custom',
        message: 'Origin and destination cannot be the same',
        condition: 'origin !== destination'
      },
      {
        field: 'package.weight.value',
        type: 'range',
        message: 'Weight must be between 0.1 and package type maximum',
        value: { min: 0.1, max: 10000 }
      },
      {
        field: 'package.declaredValue',
        type: 'range',
        message: 'Declared value must be between $1 and $100,000',
        value: { min: 1, max: 100000 }
      }
    ]
  },
  {
    section: 'contactInfo',
    rules: [
      {
        field: 'email',
        type: 'pattern',
        message: 'Please enter a valid email address',
        value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
      },
      {
        field: 'phone',
        type: 'pattern',
        message: 'Please enter a valid phone number',
        value: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$'
      }
    ]
  },
  {
    section: 'payment',
    rules: [
      {
        field: 'taxId',
        type: 'pattern',
        message: 'Tax ID must be in format XX-XXXXXXX',
        value: '^\\d{2}-\\d{7}$'
      },
      {
        field: 'poNumber',
        type: 'pattern',
        message: 'PO Number must be 4-50 alphanumeric characters',
        value: '^[A-Za-z0-9-]{4,50}$'
      }
    ]
  }
];

// Delivery Preferences
export const deliveryPreferences: DeliveryPreference[] = [
  {
    id: 'signature-required',
    name: 'Signature Required',
    description: 'Requires recipient signature for delivery',
    fee: 8,
    category: 'signature'
  },
  {
    id: 'adult-signature',
    name: 'Adult Signature Required (21+)',
    description: 'Requires adult signature with ID verification',
    fee: 12,
    category: 'signature'
  },
  {
    id: 'delivery-confirmation-sms',
    name: 'Delivery Confirmation via SMS',
    description: 'SMS notification when package is delivered',
    fee: 2,
    category: 'notification'
  },
  {
    id: 'photo-proof',
    name: 'Photo Proof of Delivery',
    description: 'Photo taken at delivery location',
    fee: 3,
    category: 'notification'
  },
  {
    id: 'saturday-delivery',
    name: 'Saturday Delivery',
    description: 'Delivery on Saturday (business days only by default)',
    fee: 25,
    category: 'timing'
  },
  {
    id: 'hold-at-location',
    name: 'Hold at Location',
    description: 'Hold package at nearby facility for pickup',
    fee: 0,
    category: 'location'
  }
];

// Service Level Preferences
export const serviceLevelPreferences: ServiceLevelPreference[] = [
  {
    id: 'most-economical',
    name: 'Most Economical',
    description: 'Prioritize lowest cost options',
    impact: 'May result in longer transit times'
  },
  {
    id: 'fastest-transit',
    name: 'Fastest Transit Time',
    description: 'Prioritize speed of delivery',
    impact: 'Higher cost for premium services'
  },
  {
    id: 'most-reliable',
    name: 'Most Reliable Carrier',
    description: 'Prioritize carriers with best track record',
    impact: 'Balanced cost and service quality'
  },
  {
    id: 'carbon-neutral',
    name: 'Carbon Neutral Options Only',
    description: 'Only show environmentally friendly options',
    impact: 'Limited service options, may increase cost'
  }
];

// Payment Methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'po',
    name: 'Purchase Order (PO)',
    description: 'Pay using company purchase order',
    fields: [
      { name: 'poNumber', type: 'text', required: true, validation: '^[A-Za-z0-9-]{4,50}$', placeholder: 'PO-2024-001234' },
      { name: 'poAmount', type: 'number', required: true, placeholder: 'Must be ≥ shipping total' },
      { name: 'poExpirationDate', type: 'date', required: true, placeholder: 'Future date required' },
      { name: 'approvalContact', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'department', type: 'text', required: false, placeholder: 'IT Department' }
    ],
    requirements: ['Valid PO number', 'Sufficient PO amount', 'Future expiration date']
  },
  {
    id: 'bol',
    name: 'Bill of Lading (BOL)',
    description: 'Use bill of lading for freight shipments',
    fields: [
      { name: 'bolNumber', type: 'text', required: true, validation: '^BOL-\\d{4}-\\d{6}$', placeholder: 'BOL-2024-123456' },
      { name: 'bolDate', type: 'date', required: true, placeholder: 'Cannot be future date' },
      { name: 'shipperReference', type: 'text', required: false, placeholder: 'Internal reference' },
      { name: 'freightTerms', type: 'select', required: true }
    ],
    requirements: ['Valid BOL format', 'Non-future BOL date']
  },
  {
    id: 'thirdparty',
    name: 'Third-Party Billing',
    description: 'Bill to third-party account',
    fields: [
      { name: 'thirdPartyAccount', type: 'text', required: true, placeholder: 'Account number' },
      { name: 'thirdPartyCompany', type: 'text', required: true, placeholder: 'Company name' },
      { name: 'thirdPartyContact', type: 'text', required: true, placeholder: 'Contact person' },
      { name: 'authorizationCode', type: 'text', required: false, placeholder: 'Optional auth code' }
    ],
    requirements: ['Valid third-party account', 'Authorized billing contact']
  },
  {
    id: 'net',
    name: 'Net Terms',
    description: 'Invoice with payment terms',
    fields: [
      { name: 'netTermsPeriod', type: 'select', required: true },
      { name: 'creditApplication', type: 'file', required: true },
      { name: 'tradeReferences', type: 'array', required: true },
      { name: 'annualRevenue', type: 'select', required: true }
    ],
    requirements: ['Credit application', 'Trade references', 'Revenue verification']
  },
  {
    id: 'corporate',
    name: 'Corporate Account',
    description: 'Existing corporate account',
    fields: [
      { name: 'accountNumber', type: 'text', required: true, placeholder: 'Existing account number' },
      { name: 'accountPin', type: 'password', required: true, validation: '^\\d{4,6}$', placeholder: '4-6 digit PIN' },
      { name: 'billingContact', type: 'text', required: true, placeholder: 'Billing contact confirmation' }
    ],
    requirements: ['Valid account number', 'Correct PIN', 'Authorized billing contact']
  }
];

// Currencies
export const currencies: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    format: '${amount}',
    exchangeRate: 1.0
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    format: 'C${amount}',
    exchangeRate: 1.35
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    format: '${amount} MXN',
    exchangeRate: 17.5
  }
];

// Main Form Configuration Export
export const formConfigData: FormConfig = {
  packageTypes,
  specialHandling,
  countries,
  industries,
  validation: validationRules,
  deliveryPreferences,
  serviceLevelPreferences,
  paymentMethods,
  currencies,
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    dataSource: 'static-mock-data'
  }
};