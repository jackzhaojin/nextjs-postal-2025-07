'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  MessageSquare, 
  Wrench, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Save
} from 'lucide-react';
import { ContactInformation } from './ContactInformation';
import { PickupInstructions } from './PickupInstructions';
import { EquipmentRequirements } from './EquipmentRequirements';
import { 
  PickupContactInfo, 
  PickupInstructionSet, 
  type EquipmentRequirements as EquipmentRequirementsType,
  LocationType, 
  PackageInfo, 
  ValidationError 
} from '@/lib/types';

interface PickupContactFormProps {
  primaryContact?: PickupContactInfo;
  backupContact?: PickupContactInfo;
  instructions?: PickupInstructionSet;
  equipmentRequirements?: EquipmentRequirementsType;
  locationType: LocationType;
  packageInfo: PackageInfo;
  onDataUpdate: (data: {
    primaryContact: PickupContactInfo;
    backupContact?: PickupContactInfo;
    instructions: PickupInstructionSet;
    equipmentRequirements: EquipmentRequirementsType;
  }) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  validationErrors?: ValidationError[];
  className?: string;
}

/**
 * PickupContactForm Component
 * 
 * Task 7.3: Master orchestrating component for pickup contact and instructions
 * Features:
 * - Tabbed interface for organized data entry
 * - Real-time validation and progress tracking
 * - Cross-section data coordination
 * - Auto-save functionality
 * - Validation state tracking
 * - Integration with form state management
 */
export function PickupContactForm({
  primaryContact,
  backupContact,
  instructions,
  equipmentRequirements,
  locationType,
  packageInfo,
  onDataUpdate,
  onSave,
  isSaving = false,
  validationErrors = [],
  className = ''
}: PickupContactFormProps) {
  console.log('📋 [PICKUP-CONTACT-FORM] Rendering pickup contact form');

  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    primaryContact: primaryContact || {
      name: '',
      mobilePhone: '',
      email: '',
      preferredContactMethod: 'phone' as const,
      authorizationLevel: 'full' as const
    },
    backupContact: backupContact,
    instructions: instructions || {},
    equipmentRequirements: equipmentRequirements || {
      dolly: false,
      applianceDolly: false,
      furniturePads: false,
      straps: false,
      palletJack: false,
      twoPersonTeam: false,
      loadingAssistance: 'customer' as const
    }
  });

  const [validationState, setValidationState] = useState({
    contact: true,
    instructions: true,
    equipment: true
  });

  const [completionState, setCompletionState] = useState({
    contact: 0,
    instructions: 0,
    equipment: 0
  });

  // Calculate form completion percentage (stable function, no state updates)
  const calculateCompletion = useCallback(() => {
    console.log('📋 [PICKUP-CONTACT-FORM] Calculating form completion');
    
    // Contact completion
    let contactScore = 0;
    const contact = formData.primaryContact;
    if (contact.name) contactScore += 25;
    if (contact.mobilePhone) contactScore += 25;
    if (contact.email) contactScore += 25;
    if (contact.preferredContactMethod) contactScore += 25;

    // Instructions completion
    let instructionsScore = 0;
    const instr = formData.instructions;
    if (instr.gateAccess) instructionsScore += 20;
    if (instr.parkingLoading) instructionsScore += 20;
    if (instr.packageLocation) instructionsScore += 30;
    if (instr.driverInstructions) instructionsScore += 30;

    // Equipment completion (always 100% since defaults are valid)
    const equipmentScore = 100;

    const newCompletionState = {
      contact: contactScore,
      instructions: instructionsScore,
      equipment: equipmentScore
    };

    // Only update state if it actually changed
    if (JSON.stringify(newCompletionState) !== JSON.stringify(completionState)) {
      setCompletionState(newCompletionState);
    }

    return Math.round((contactScore + instructionsScore + equipmentScore) / 3);
  }, [formData, completionState]);

  // Validate form sections (stable function, no state updates in calculation)
  const validateForm = useCallback(() => {
    console.log('📋 [PICKUP-CONTACT-FORM] Validating form');
    
    const errors = {
      contact: true,
      instructions: true,
      equipment: true
    };

    // Validate contact information
    const contact = formData.primaryContact;
    if (!contact.name || contact.name.length < 2) errors.contact = false;
    if (!contact.mobilePhone || contact.mobilePhone.length < 10) errors.contact = false;
    if (!contact.email || !/\S+@\S+\.\S+/.test(contact.email)) errors.contact = false;

    // Instructions validation (less strict - just recommendations)
    // Instructions are optional but recommended

    // Equipment validation (always valid since defaults are acceptable)
    
    // Only update state if it actually changed
    if (JSON.stringify(errors) !== JSON.stringify(validationState)) {
      setValidationState(errors);
    }
    
    return errors;
  }, [formData, validationState]);

  // Handle contact information updates
  const handleContactUpdate = useCallback((primary: PickupContactInfo, backup?: PickupContactInfo) => {
    console.log('📋 [PICKUP-CONTACT-FORM] Contact information updated');
    
    setFormData(prev => ({
      ...prev,
      primaryContact: primary,
      backupContact: backup
    }));
  }, []);

  // Handle instructions updates
  const handleInstructionsUpdate = useCallback((newInstructions: PickupInstructionSet) => {
    console.log('📋 [PICKUP-CONTACT-FORM] Instructions updated');
    
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  }, []);

  // Handle equipment requirements updates
  const handleEquipmentUpdate = useCallback((newRequirements: EquipmentRequirementsType) => {
    console.log('📋 [PICKUP-CONTACT-FORM] Equipment requirements updated');
    
    setFormData(prev => ({
      ...prev,
      equipmentRequirements: newRequirements
    }));
  }, []);

  // Update parent component when form data changes
  useEffect(() => {
    console.log('📋 [PICKUP-CONTACT-FORM] Form data changed, updating parent');
    onDataUpdate(formData);
  }, [formData, onDataUpdate]);

  // Run validation and completion calculation when formData changes
  useEffect(() => {
    validateForm();
    calculateCompletion();
  }, [formData]); // Only depend on formData, not the functions

  // Handle save action
  const handleSave = useCallback(async () => {
    console.log('📋 [PICKUP-CONTACT-FORM] Saving form data');
    
    if (onSave) {
      try {
        await onSave();
      } catch (error) {
        console.error('❌ [PICKUP-CONTACT-FORM] Save failed:', error);
      }
    }
  }, [onSave]);

  // Get tab status
  const getTabStatus = (tab: string) => {
    const isValid = validationState[tab as keyof typeof validationState];
    const completion = completionState[tab as keyof typeof completionState];
    
    if (!isValid) return 'error';
    if (completion === 100) return 'complete';
    if (completion > 0) return 'partial';
    return 'incomplete';
  };

  // Get tab icon
  const getTabIcon = (tab: string, iconComponent: React.ReactNode) => {
    const status = getTabStatus(tab);
    
    if (status === 'complete') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return iconComponent;
  };

  const overallCompletion = calculateCompletion();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg">Pickup Contact & Instructions</CardTitle>
            <Badge 
              variant={overallCompletion === 100 ? "default" : "secondary"}
              className={overallCompletion === 100 ? "bg-green-600" : ""}
            >
              {overallCompletion}% Complete
            </Badge>
          </div>
          <Progress value={overallCompletion} className="h-2" />
        </CardHeader>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            {getTabIcon('contact', <User className="h-4 w-4" />)}
            Contact Info
            <Badge variant="outline" className="ml-1 text-xs">
              {completionState.contact}%
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            {getTabIcon('instructions', <MessageSquare className="h-4 w-4" />)}
            Instructions
            <Badge variant="outline" className="ml-1 text-xs">
              {completionState.instructions}%
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            {getTabIcon('equipment', <Wrench className="h-4 w-4" />)}
            Equipment
            <Badge variant="outline" className="ml-1 text-xs">
              {completionState.equipment}%
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="mt-6">
          <ContactInformation
            primaryContact={formData.primaryContact}
            backupContact={formData.backupContact}
            onContactUpdate={handleContactUpdate}
            validationErrors={validationErrors.filter(e => e.field?.startsWith('contact'))}
            isRequired={true}
          />
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="mt-6">
          <PickupInstructions
            instructions={formData.instructions}
            onInstructionsUpdate={handleInstructionsUpdate}
            locationType={locationType}
            packageInfo={packageInfo}
          />
        </TabsContent>

        {/* Equipment Requirements Tab */}
        <TabsContent value="equipment" className="mt-6">
          <EquipmentRequirements
            requirements={formData.equipmentRequirements}
            onRequirementsUpdate={handleEquipmentUpdate}
            packageInfo={packageInfo}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation and Save */}
      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Tab Navigation Hints */}
              {activeTab === 'contact' && completionState.contact > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('instructions')}
                  className="flex items-center gap-2"
                >
                  Next: Instructions
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {activeTab === 'instructions' && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('equipment')}
                  className="flex items-center gap-2"
                >
                  Next: Equipment
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Save Button */}
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !validationState.contact}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Progress'}
              </Button>
            )}
          </div>

          {/* Validation Summary */}
          {(!validationState.contact || validationErrors.length > 0) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Please complete required fields:</span>
              </div>
              <ul className="text-sm text-red-700 mt-2 ml-6 list-disc">
                {!validationState.contact && (
                  <li>Complete primary contact information (name, phone, email)</li>
                )}
                {validationErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
