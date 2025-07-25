'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Camera,
  MapPin,
  Timer,
  Calendar,
  Phone
} from 'lucide-react';
import { 
  PackageReadinessSettings, 
  PreparationItem, 
  EmergencyContactProtocol,
  ContactInfo,
  PackageInfo,
  ValidationError 
} from '@/lib/types';

interface PackageReadinessProps {
  readiness?: PackageReadinessSettings;
  onReadinessUpdate: (readiness: PackageReadinessSettings) => void;
  packageInfo: PackageInfo;
  pickupSchedule?: { date: string; timeSlot: { startTime: string; endTime: string; } };
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
}

/**
 * PackageReadiness Component
 * 
 * Manages package preparation timing and readiness validation:
 * - Ready time specification with pickup window validation
 * - Preparation time calculator with package complexity assessment
 * - Interactive preparation checklist with completion tracking
 * - Emergency contact protocol for readiness issues
 * - Photo upload capability for preparation verification
 * - Last-minute adjustment procedures
 */
export function PackageReadiness({
  readiness,
  onReadinessUpdate,
  packageInfo,
  pickupSchedule,
  onValidation,
  className = ''
}: PackageReadinessProps) {
  console.log('📦 [PACKAGE-READINESS] Rendering package readiness component');

  // Default preparation checklist based on package type
  const getDefaultChecklist = (pkg: PackageInfo): PreparationItem[] => {
    const baseItems: PreparationItem[] = [
      {
        id: 'shipping-label',
        label: 'Shipping Label Attached',
        description: 'Ensure shipping label is clearly visible and securely attached',
        required: true,
        completed: false,
        category: 'labeling'
      },
      {
        id: 'package-secure',
        label: 'Package Securely Sealed',
        description: 'Package is properly sealed and contents secure',
        required: true,
        completed: false,
        category: 'packaging'
      },
      {
        id: 'location-accessible',
        label: 'Location Accessible',
        description: 'Pickup location is clear and accessible for driver',
        required: true,
        completed: false,
        category: 'access'
      }
    ];

    // Add items based on package characteristics
    if (pkg.declaredValue > 1000) {
      baseItems.push({
        id: 'insurance-docs',
        label: 'Insurance Documentation',
        description: 'Insurance forms completed for high-value items',
        required: true,
        completed: false,
        category: 'documentation'
      });
    }

    if (pkg.specialHandling.includes('fragile')) {
      baseItems.push({
        id: 'fragile-marking',
        label: 'Fragile Markings',
        description: 'Clear fragile markings and handling instructions visible',
        required: true,
        completed: false,
        category: 'labeling'
      });
    }

    if (pkg.specialHandling.includes('hazmat')) {
      baseItems.push({
        id: 'hazmat-docs',
        label: 'Hazmat Documentation',
        description: 'All required hazardous materials documentation completed',
        required: true,
        completed: false,
        category: 'documentation'
      });
    }

    if (pkg.type === 'pallet' || pkg.type === 'crate') {
      baseItems.push({
        id: 'lifting-equipment',
        label: 'Lifting Equipment Ready',
        description: 'Forklift or lifting equipment available if needed',
        required: false,
        completed: false,
        category: 'access'
      });
    }

    return baseItems;
  };

  // Calculate estimated preparation time based on package complexity
  const calculatePreparationTime = (pkg: PackageInfo): number => {
    let baseTime = 15; // 15 minutes base

    // Add time based on package type
    switch (pkg.type) {
      case 'envelope': baseTime += 5; break;
      case 'small': baseTime += 10; break;
      case 'medium': baseTime += 20; break;
      case 'large': baseTime += 30; break;
      case 'pallet': baseTime += 45; break;
      case 'crate': baseTime += 60; break;
      case 'multiple': baseTime += 30; break;
    }

    // Add time for special handling
    baseTime += pkg.specialHandling.length * 10;

    // Add time for high value
    if (pkg.declaredValue > 1000) baseTime += 15;
    if (pkg.declaredValue > 5000) baseTime += 30;

    return baseTime;
  };

  // Default readiness settings
  const defaultReadiness: PackageReadinessSettings = {
    readyTime: pickupSchedule 
      ? new Date(new Date(`${pickupSchedule.date}T${pickupSchedule.timeSlot.startTime}`).getTime() - 30 * 60000).toISOString()
      : new Date(Date.now() + 24 * 60 * 60000).toISOString(),
    preparationTime: calculatePreparationTime(packageInfo),
    preparationChecklist: getDefaultChecklist(packageInfo),
    lastMinuteAdjustmentAllowed: true,
    emergencyContactProtocol: {
      enabled: true,
      contacts: [],
      escalationTimeMinutes: 30,
      autoReschedule: false
    }
  };

  const [currentReadiness, setCurrentReadiness] = useState<PackageReadinessSettings>(
    readiness || defaultReadiness
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [photoUploads, setPhotoUploads] = useState<File[]>([]);

  // Update readiness when prop changes
  useEffect(() => {
    if (readiness) {
      console.log('📦 [PACKAGE-READINESS] Updating readiness from props');
      setCurrentReadiness(readiness);
    }
  }, [readiness]);

  // Validation logic
  const validateReadiness = useCallback((settings: PackageReadinessSettings): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Ready time must be at least 30 minutes before pickup
    if (pickupSchedule) {
      const readyTime = new Date(settings.readyTime);
      const pickupTime = new Date(`${pickupSchedule.date}T${pickupSchedule.timeSlot.startTime}`);
      const timeDiff = pickupTime.getTime() - readyTime.getTime();
      const minDiff = 30 * 60 * 1000; // 30 minutes

      if (timeDiff < minDiff) {
        errors.push({
          field: 'readyTime',
          message: 'Ready time must be at least 30 minutes before pickup window',
          code: 'READY_TIME_TOO_LATE'
        });
      }
    }

    // All required checklist items must be completed before submission
    const requiredIncomplete = settings.preparationChecklist.filter(
      item => item.required && !item.completed
    );
    if (requiredIncomplete.length > 0) {
      errors.push({
        field: 'preparationChecklist',
        message: `${requiredIncomplete.length} required preparation items not completed`,
        code: 'REQUIRED_ITEMS_INCOMPLETE'
      });
    }

    // Emergency contact validation
    if (settings.emergencyContactProtocol.enabled && settings.emergencyContactProtocol.contacts.length === 0) {
      errors.push({
        field: 'emergencyContactProtocol.contacts',
        message: 'At least one emergency contact required',
        code: 'EMERGENCY_CONTACT_REQUIRED'
      });
    }

    return errors;
  }, [pickupSchedule]);

  // Update readiness and validate
  const updateReadiness = useCallback((newReadiness: PackageReadinessSettings) => {
    console.log('📦 [PACKAGE-READINESS] Updating readiness:', newReadiness);
    
    setCurrentReadiness(newReadiness);
    const errors = validateReadiness(newReadiness);
    setValidationErrors(errors);
    
    if (onValidation) {
      onValidation(errors.length === 0, errors);
    }
    
    onReadinessUpdate(newReadiness);
  }, [onReadinessUpdate, validateReadiness, onValidation]);

  // Handle checklist item completion
  const toggleChecklistItem = useCallback((itemId: string) => {
    const newChecklist = currentReadiness.preparationChecklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    updateReadiness({
      ...currentReadiness,
      preparationChecklist: newChecklist
    });
  }, [currentReadiness, updateReadiness]);

  // Add emergency contact
  const addEmergencyContact = useCallback(() => {
    const newContact: ContactInfo = {
      name: '',
      company: '',
      phone: '',
      email: ''
    };
    
    updateReadiness({
      ...currentReadiness,
      emergencyContactProtocol: {
        ...currentReadiness.emergencyContactProtocol,
        contacts: [...currentReadiness.emergencyContactProtocol.contacts, newContact]
      }
    });
  }, [currentReadiness, updateReadiness]);

  // Update emergency contact
  const updateEmergencyContact = useCallback((index: number, contact: ContactInfo) => {
    const newContacts = [...currentReadiness.emergencyContactProtocol.contacts];
    newContacts[index] = contact;
    
    updateReadiness({
      ...currentReadiness,
      emergencyContactProtocol: {
        ...currentReadiness.emergencyContactProtocol,
        contacts: newContacts
      }
    });
  }, [currentReadiness, updateReadiness]);

  // Handle photo upload
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotoUploads(prev => [...prev, ...files]);
  }, []);

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (currentReadiness.preparationChecklist.filter(item => item.completed).length / 
     currentReadiness.preparationChecklist.length) * 100
  );

  // Get checklist items by category
  const checklistByCategory = currentReadiness.preparationChecklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PreparationItem[]>);

  // Get error for field
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Ready Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            Package Ready Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ready-time">Ready Time</Label>
              <Input
                id="ready-time"
                type="datetime-local"
                value={currentReadiness.readyTime.slice(0, 16)}
                onChange={(e) => {
                  updateReadiness({
                    ...currentReadiness,
                    readyTime: new Date(e.target.value).toISOString()
                  });
                }}
              />
              {getFieldError('readyTime') && (
                <div className="text-sm text-red-600 mt-1">
                  {getFieldError('readyTime')}
                </div>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Package must be ready at least 30 minutes before pickup
              </p>
            </div>
            <div>
              <Label htmlFor="prep-time">Estimated Preparation Time</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="prep-time"
                  type="number"
                  value={currentReadiness.preparationTime}
                  onChange={(e) => {
                    updateReadiness({
                      ...currentReadiness,
                      preparationTime: parseInt(e.target.value) || 0
                    });
                  }}
                  min="5"
                  max="240"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Time needed to prepare package for pickup
              </p>
            </div>
          </div>

          {pickupSchedule && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Pickup Schedule</h4>
              <div className="flex items-center gap-4 text-sm text-blue-800">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(pickupSchedule.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {pickupSchedule.timeSlot.startTime} - {pickupSchedule.timeSlot.endTime}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preparation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Preparation Checklist
            </div>
            <div className="flex items-center gap-2">
              <Progress value={completionPercentage} className="w-24" />
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(checklistByCategory).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                {category === 'labeling' && <FileText className="h-4 w-4" />}
                {category === 'packaging' && <Package className="h-4 w-4" />}
                {category === 'access' && <MapPin className="h-4 w-4" />}
                {category === 'documentation' && <FileText className="h-4 w-4" />}
                {category.replace('-', ' ')}
              </h4>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleChecklistItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">{item.label}</Label>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          {item.completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {getFieldError('preparationChecklist') && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('preparationChecklist')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-600" />
            Photo Verification (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photo-upload">Upload preparation photos</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              Photos can help verify package preparation and reduce pickup delays
            </p>
          </div>

          {photoUploads.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Uploaded Photos ({photoUploads.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photoUploads.map((file, index) => (
                  <div key={index} className="border rounded-lg p-2 text-center">
                    <Camera className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            Emergency Contact Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={currentReadiness.emergencyContactProtocol.enabled}
              onCheckedChange={(checked) => {
                updateReadiness({
                  ...currentReadiness,
                  emergencyContactProtocol: {
                    ...currentReadiness.emergencyContactProtocol,
                    enabled: checked as boolean
                  }
                });
              }}
            />
            <div>
              <Label className="font-medium">Enable emergency contact protocol</Label>
              <p className="text-sm text-gray-600">
                Automated escalation if package readiness issues arise
              </p>
            </div>
          </div>

          {currentReadiness.emergencyContactProtocol.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Escalation Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentReadiness.emergencyContactProtocol.escalationTimeMinutes}
                      onChange={(e) => {
                        updateReadiness({
                          ...currentReadiness,
                          emergencyContactProtocol: {
                            ...currentReadiness.emergencyContactProtocol,
                            escalationTimeMinutes: parseInt(e.target.value) || 30
                          }
                        });
                      }}
                      min="15"
                      max="120"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={currentReadiness.emergencyContactProtocol.autoReschedule}
                    onCheckedChange={(checked) => {
                      updateReadiness({
                        ...currentReadiness,
                        emergencyContactProtocol: {
                          ...currentReadiness.emergencyContactProtocol,
                          autoReschedule: checked as boolean
                        }
                      });
                    }}
                  />
                  <Label className="text-sm">Auto-reschedule on issues</Label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium">Emergency Contacts</Label>
                  <Button variant="outline" size="sm" onClick={addEmergencyContact}>
                    Add Contact
                  </Button>
                </div>

                {currentReadiness.emergencyContactProtocol.contacts.map((contact, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => {
                            updateEmergencyContact(index, { ...contact, name: e.target.value });
                          }}
                          placeholder="Contact name"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => {
                            updateEmergencyContact(index, { ...contact, phone: e.target.value });
                          }}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={contact.email}
                          onChange={(e) => {
                            updateEmergencyContact(index, { ...contact, email: e.target.value });
                          }}
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={contact.company || ''}
                          onChange={(e) => {
                            updateEmergencyContact(index, { ...contact, company: e.target.value });
                          }}
                          placeholder="Company name"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {getFieldError('emergencyContactProtocol.contacts') && (
                  <div className="text-sm text-red-600">
                    {getFieldError('emergencyContactProtocol.contacts')}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Last-Minute Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Last-Minute Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={currentReadiness.lastMinuteAdjustmentAllowed}
              onCheckedChange={(checked) => {
                updateReadiness({
                  ...currentReadiness,
                  lastMinuteAdjustmentAllowed: checked as boolean
                });
              }}
            />
            <div>
              <Label className="font-medium">Allow last-minute ready time adjustments</Label>
              <p className="text-sm text-gray-600">
                Permits ready time changes up to 1 hour before pickup (subject to availability)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Please address the following issues:</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
