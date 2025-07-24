'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Car, 
  Package, 
  MessageSquare, 
  AlertTriangle, 
  Shield,
  Lightbulb,
  Copy,
  CheckCircle
} from 'lucide-react';
import { PickupInstructionSet, InstructionTemplate, LocationType, PackageInfo } from '@/lib/types';

interface PickupInstructionsProps {
  instructions?: PickupInstructionSet;
  onInstructionsUpdate: (instructions: PickupInstructionSet) => void;
  locationType: LocationType;
  packageInfo: PackageInfo;
  templateOptions?: InstructionTemplate[];
  className?: string;
}

/**
 * PickupInstructions Component
 * 
 * Task 7.3: Sophisticated instruction input system with template support
 * Features:
 * - Rich text input areas with character counting
 * - Template-based instruction suggestions
 * - Auto-complete based on location type
 * - Instruction quality validation
 * - Driver-facing instruction preview
 * - Industry-specific templates
 */
export function PickupInstructions({
  instructions,
  onInstructionsUpdate,
  locationType,
  packageInfo,
  templateOptions = [],
  className = ''
}: PickupInstructionsProps) {
  console.log('📝 [PICKUP-INSTRUCTIONS] Rendering pickup instructions component');

  const [instructionData, setInstructionData] = useState<PickupInstructionSet>({
    gateAccess: instructions?.gateAccess || '',
    parkingLoading: instructions?.parkingLoading || '',
    packageLocation: instructions?.packageLocation || '',
    driverInstructions: instructions?.driverInstructions || '',
    specialConsiderations: instructions?.specialConsiderations || '',
    safetyRequirements: instructions?.safetyRequirements || []
  });

  const [characterCounts, setCharacterCounts] = useState({
    gateAccess: instructions?.gateAccess?.length || 0,
    parkingLoading: instructions?.parkingLoading?.length || 0,
    packageLocation: instructions?.packageLocation?.length || 0,
    driverInstructions: instructions?.driverInstructions?.length || 0,
    specialConsiderations: instructions?.specialConsiderations?.length || 0
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Character limits for different instruction fields
  const characterLimits = {
    gateAccess: 200,
    parkingLoading: 200,
    packageLocation: 100,
    driverInstructions: 300,
    specialConsiderations: 250
  };

  // Predefined templates based on location type
  const getLocationTemplates = useCallback((type: LocationType): InstructionTemplate[] => {
    console.log('📝 [PICKUP-INSTRUCTIONS] Getting templates for location type:', type);
    
    const baseTemplates: InstructionTemplate[] = [
      {
        id: 'loading-dock-standard',
        name: 'Standard Loading Dock',
        category: 'location',
        locationType: ['loading-dock'],
        template: 'Packages are located at loading dock #{dockNumber}. Use overhead door access. Forklift available on-site.',
        variables: ['dockNumber']
      },
      {
        id: 'ground-level-commercial',
        name: 'Commercial Ground Level',
        category: 'location',
        locationType: ['ground-level'],
        template: 'Packages are at ground level entrance. Ring bell or call contact person upon arrival. Limited parking available.',
      },
      {
        id: 'residential-standard',
        name: 'Residential Pickup',
        category: 'location',
        locationType: ['residential'],
        template: 'Packages are at front door/garage. Please ring doorbell and wait for contact person before proceeding.',
      },
      {
        id: 'warehouse-standard',
        name: 'Warehouse Facility',
        category: 'location',
        locationType: ['storage-facility'],
        template: 'Check in at warehouse office first. Packages are in designated pickup area. Loading equipment available.',
      },
      {
        id: 'construction-site',
        name: 'Construction Site',
        category: 'safety',
        locationType: ['construction-site'],
        template: 'Hard hat and safety vest required. Check in with site supervisor. Watch for construction equipment and materials.',
      }
    ];

    return baseTemplates.filter(template => 
      template.locationType.includes(type) || template.locationType.includes('other')
    );
  }, []);

  // Common instruction phrases for quick insertion
  const quickPhrases = {
    access: [
      'Ring bell upon arrival',
      'Call contact person before entering',
      'Check in at front desk/office',
      'Gate code will be provided separately',
      'Security clearance required'
    ],
    parking: [
      'Limited parking available',
      'Park in designated visitor area',
      'Use loading zone only',
      'Street parking available',
      'No overnight parking allowed'
    ],
    safety: [
      'Hard hat required',
      'Safety vest required',
      'Closed-toe shoes required',
      'Watch for overhead equipment',
      'Forklift traffic in area'
    ]
  };

  // Handle instruction field changes
  const handleFieldChange = useCallback((field: keyof PickupInstructionSet, value: string) => {
    console.log('📝 [PICKUP-INSTRUCTIONS] Field changed:', field, value.length);
    
    // Enforce character limits
    const limit = characterLimits[field as keyof typeof characterLimits];
    if (limit && value.length > limit) {
      console.log('📝 [PICKUP-INSTRUCTIONS] Character limit exceeded for field:', field);
      return;
    }

    setInstructionData(prev => ({
      ...prev,
      [field]: value
    }));

    setCharacterCounts(prev => ({
      ...prev,
      [field]: value.length
    }));
  }, [characterLimits]);

  // Apply template to appropriate field
  const applyTemplate = useCallback((template: InstructionTemplate) => {
    console.log('📝 [PICKUP-INSTRUCTIONS] Applying template:', template.name);
    
    let fieldToUpdate: keyof PickupInstructionSet;
    switch (template.category) {
      case 'access':
        fieldToUpdate = 'gateAccess';
        break;
      case 'parking':
        fieldToUpdate = 'parkingLoading';
        break;
      case 'location':
        fieldToUpdate = 'packageLocation';
        break;
      case 'driver':
        fieldToUpdate = 'driverInstructions';
        break;
      case 'safety':
        fieldToUpdate = 'specialConsiderations';
        break;
      default:
        fieldToUpdate = 'driverInstructions';
    }

    // Replace template variables if any
    let processedTemplate = template.template;
    if (template.variables?.includes('dockNumber')) {
      processedTemplate = processedTemplate.replace('{dockNumber}', '[Dock Number]');
    }

    setInstructionData(prev => ({
      ...prev,
      [fieldToUpdate]: processedTemplate
    }));

    setCharacterCounts(prev => ({
      ...prev,
      [fieldToUpdate]: processedTemplate.length
    }));

    setSelectedTemplate(template.id);
  }, []);

  // Insert quick phrase
  const insertQuickPhrase = useCallback((field: keyof PickupInstructionSet, phrase: string) => {
    console.log('📝 [PICKUP-INSTRUCTIONS] Inserting quick phrase:', phrase);
    
    const currentValue = instructionData[field] as string || '';
    const newValue = currentValue ? `${currentValue}. ${phrase}` : phrase;
    
    handleFieldChange(field, newValue);
  }, [instructionData, handleFieldChange]);

  // Update parent component when data changes
  useEffect(() => {
    console.log('📝 [PICKUP-INSTRUCTIONS] Instructions changed, updating parent');
    onInstructionsUpdate(instructionData);
  }, [instructionData, onInstructionsUpdate]);

  // Generate driver preview
  const generateDriverPreview = useCallback(() => {
    const instructions = [];
    
    if (instructionData.gateAccess) {
      instructions.push(`ACCESS: ${instructionData.gateAccess}`);
    }
    if (instructionData.parkingLoading) {
      instructions.push(`PARKING: ${instructionData.parkingLoading}`);
    }
    if (instructionData.packageLocation) {
      instructions.push(`PACKAGE LOCATION: ${instructionData.packageLocation}`);
    }
    if (instructionData.driverInstructions) {
      instructions.push(`SPECIAL INSTRUCTIONS: ${instructionData.driverInstructions}`);
    }
    if (instructionData.specialConsiderations) {
      instructions.push(`SAFETY/CONSIDERATIONS: ${instructionData.specialConsiderations}`);
    }
    
    return instructions.join('\n\n');
  }, [instructionData]);

  const availableTemplates = getLocationTemplates(locationType);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Templates Section */}
      {availableTemplates.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5" />
              Quick Templates for {locationType.replace('-', ' ')} pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableTemplates.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className={`text-left h-auto p-3 ${selectedTemplate === template.id ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {template.template}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gate Access Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Gate Code / Access Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Textarea
              value={instructionData.gateAccess}
              onChange={(e) => handleFieldChange('gateAccess', e.target.value)}
              placeholder="Enter gate codes, access procedures, or security requirements..."
              className="min-h-[80px] pr-16"
              maxLength={characterLimits.gateAccess}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {characterCounts.gateAccess}/{characterLimits.gateAccess}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPhrases.access.map(phrase => (
              <Button
                key={phrase}
                variant="outline"
                size="sm"
                onClick={() => insertQuickPhrase('gateAccess', phrase)}
                className="text-xs h-7"
              >
                {phrase}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parking/Loading Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" />
            Parking / Loading Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Textarea
              value={instructionData.parkingLoading}
              onChange={(e) => handleFieldChange('parkingLoading', e.target.value)}
              placeholder="Provide parking directions, loading zone information, and vehicle access details..."
              className="min-h-[80px] pr-16"
              maxLength={characterLimits.parkingLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {characterCounts.parkingLoading}/{characterLimits.parkingLoading}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPhrases.parking.map(phrase => (
              <Button
                key={phrase}
                variant="outline"
                size="sm"
                onClick={() => insertQuickPhrase('parkingLoading', phrase)}
                className="text-xs h-7"
              >
                {phrase}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Package Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Package Location Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={instructionData.packageLocation}
              onChange={(e) => handleFieldChange('packageLocation', e.target.value)}
              placeholder="Specific location of packages within the facility (e.g., reception desk, loading dock bay 3, warehouse section B)..."
              className="min-h-[60px] pr-16"
              maxLength={characterLimits.packageLocation}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {characterCounts.packageLocation}/{characterLimits.packageLocation}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            General Driver Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={instructionData.driverInstructions}
              onChange={(e) => handleFieldChange('driverInstructions', e.target.value)}
              placeholder="Additional instructions for the driver including contact procedures, timing requirements, or special handling notes..."
              className="min-h-[100px] pr-16"
              maxLength={characterLimits.driverInstructions}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {characterCounts.driverInstructions}/{characterLimits.driverInstructions}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Considerations / Safety */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Special Considerations / Safety Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Textarea
              value={instructionData.specialConsiderations}
              onChange={(e) => handleFieldChange('specialConsiderations', e.target.value)}
              placeholder="Safety requirements, special handling needs, or important considerations for the pickup..."
              className="min-h-[80px] pr-16"
              maxLength={characterLimits.specialConsiderations}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {characterCounts.specialConsiderations}/{characterLimits.specialConsiderations}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPhrases.safety.map(phrase => (
              <Button
                key={phrase}
                variant="outline"
                size="sm"
                onClick={() => insertQuickPhrase('specialConsiderations', phrase)}
                className="text-xs h-7"
              >
                {phrase}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Preview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base text-green-900">
              <CheckCircle className="h-4 w-4" />
              Driver Instructions Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div className="bg-white p-4 rounded-md border text-sm font-mono whitespace-pre-line">
              {generateDriverPreview() || 'No instructions provided yet.'}
            </div>
            <p className="text-xs text-green-700 mt-2">
              This is how your instructions will appear to the driver on their mobile device.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Instruction Guidelines */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-2">Instruction Guidelines</p>
              <ul className="text-amber-800 space-y-1 text-xs">
                <li>• Be specific about locations and access procedures</li>
                <li>• Include gate codes or access information separately for security</li>
                <li>• Mention any safety requirements or special considerations</li>
                <li>• Provide backup contact information for complex locations</li>
                <li>• Keep instructions clear and concise for driver efficiency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
