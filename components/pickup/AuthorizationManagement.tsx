'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  User, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Eye,
  FileText,
  Clock,
  Phone,
  Building,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  AuthorizationSettings, 
  PersonnelAuthorization, 
  UniversalAuthSettings, 
  SecurityProtocol, 
  EmergencyContact, 
  TimeBasedAuth,
  ComplianceRequirement,
  ContactInfo,
  BusinessHours,
  ValidationError 
} from '@/lib/types';

interface AuthorizationManagementProps {
  authorization?: AuthorizationSettings;
  onAuthorizationUpdate: (authorization: AuthorizationSettings) => void;
  packageValue: number;
  securityRequirements: SecurityProtocol[];
  contactInfo: ContactInfo;
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
}

/**
 * AuthorizationManagement Component
 * 
 * Comprehensive authorization system for pickup scheduling:
 * - Primary contact authorization with role-based permissions
 * - Additional authorized personnel management
 * - High-value shipment security protocols
 * - Universal authorization options for trusted locations
 * - Emergency contact procedures
 * - Compliance requirement validation
 * - Time-based authorization restrictions
 */
export function AuthorizationManagement({
  authorization,
  onAuthorizationUpdate,
  packageValue,
  securityRequirements,
  contactInfo,
  onValidation,
  className = ''
}: AuthorizationManagementProps) {
  console.log('🛡️ [AUTHORIZATION-MANAGEMENT] Rendering authorization management');

  // Determine if high-value security is needed
  const isHighValue = packageValue > 1000;
  const isExtremeDriveValue = packageValue > 5000;

  // Default authorization settings
  const defaultAuthorization: AuthorizationSettings = {
    primaryAuthorization: {
      contactInfo: contactInfo,
      authorizationLevel: 'full',
      idVerificationRequired: isHighValue,
      signatureAuthority: true,
      relationship: 'primary-contact',
      authorizationScope: ['package-release', 'schedule-modification', 'documentation-signing'],
      timeBasedAuthorization: undefined
    },
    additionalPersonnel: [],
    universalAuthorization: {
      anyoneAtLocation: false,
      departmentLevel: false,
      department: '',
      roleBasedAuth: false,
      allowedRoles: [],
      timeRestrictions: undefined
    },
    securityRequirements: isHighValue ? securityRequirements : [],
    emergencyContacts: []
  };

  const [currentAuthorization, setCurrentAuthorization] = useState<AuthorizationSettings>(
    authorization || defaultAuthorization
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showAdvancedSecurity, setShowAdvancedSecurity] = useState(isHighValue);

  // Update authorization when prop changes
  useEffect(() => {
    if (authorization) {
      console.log('🛡️ [AUTHORIZATION-MANAGEMENT] Updating authorization from props');
      setCurrentAuthorization(authorization);
    }
  }, [authorization]);

  // Validation logic
  const validateAuthorization = useCallback((auth: AuthorizationSettings): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Primary authorization validation
    if (!auth.primaryAuthorization.contactInfo.name.trim()) {
      errors.push({
        field: 'primaryAuthorization.contactInfo.name',
        message: 'Primary contact name is required',
        code: 'PRIMARY_NAME_REQUIRED'
      });
    }

    if (!auth.primaryAuthorization.contactInfo.phone.trim()) {
      errors.push({
        field: 'primaryAuthorization.contactInfo.phone',
        message: 'Primary contact phone is required',
        code: 'PRIMARY_PHONE_REQUIRED'
      });
    }

    // Validate additional personnel
    auth.additionalPersonnel.forEach((person, index) => {
      if (!person.contactInfo.name.trim()) {
        errors.push({
          field: `additionalPersonnel[${index}].contactInfo.name`,
          message: `Additional personnel #${index + 1} name is required`,
          code: 'PERSONNEL_NAME_REQUIRED'
        });
      }
    });

    // High-value shipment validations
    if (isHighValue) {
      if (auth.securityRequirements.length === 0) {
        errors.push({
          field: 'securityRequirements',
          message: 'Security requirements must be specified for high-value shipments',
          code: 'SECURITY_REQUIRED'
        });
      }

      // Must have ID verification for high-value
      if (!auth.primaryAuthorization.idVerificationRequired) {
        errors.push({
          field: 'primaryAuthorization.idVerificationRequired',
          message: 'ID verification required for high-value shipments',
          code: 'ID_VERIFICATION_REQUIRED'
        });
      }
    }

    // Universal authorization validation
    if (auth.universalAuthorization.departmentLevel && !auth.universalAuthorization.department?.trim()) {
      errors.push({
        field: 'universalAuthorization.department',
        message: 'Department name required for department-level authorization',
        code: 'DEPARTMENT_REQUIRED'
      });
    }

    if (auth.universalAuthorization.roleBasedAuth && auth.universalAuthorization.allowedRoles.length === 0) {
      errors.push({
        field: 'universalAuthorization.allowedRoles',
        message: 'At least one role must be specified for role-based authorization',
        code: 'ROLES_REQUIRED'
      });
    }

    return errors;
  }, [isHighValue]);

  // Update authorization and validate
  const updateAuthorization = useCallback((newAuthorization: AuthorizationSettings) => {
    console.log('🛡️ [AUTHORIZATION-MANAGEMENT] Updating authorization:', newAuthorization);
    
    setCurrentAuthorization(newAuthorization);
    const errors = validateAuthorization(newAuthorization);
    setValidationErrors(errors);
    
    if (onValidation) {
      onValidation(errors.length === 0, errors);
    }
    
    onAuthorizationUpdate(newAuthorization);
  }, [onAuthorizationUpdate, validateAuthorization, onValidation]);

  // Add additional personnel
  const addAdditionalPersonnel = useCallback(() => {
    const newPerson: PersonnelAuthorization = {
      contactInfo: { name: '', company: '', phone: '', email: '' },
      authorizationLevel: 'limited',
      idVerificationRequired: false,
      signatureAuthority: false,
      relationship: 'colleague',
      authorizationScope: ['package-release'],
      timeBasedAuthorization: undefined
    };

    updateAuthorization({
      ...currentAuthorization,
      additionalPersonnel: [...currentAuthorization.additionalPersonnel, newPerson]
    });
  }, [currentAuthorization, updateAuthorization]);

  // Update additional personnel
  const updateAdditionalPersonnel = useCallback((index: number, updates: Partial<PersonnelAuthorization>) => {
    const newPersonnel = [...currentAuthorization.additionalPersonnel];
    newPersonnel[index] = { ...newPersonnel[index], ...updates };

    updateAuthorization({
      ...currentAuthorization,
      additionalPersonnel: newPersonnel
    });
  }, [currentAuthorization, updateAuthorization]);

  // Remove additional personnel
  const removeAdditionalPersonnel = useCallback((index: number) => {
    const newPersonnel = currentAuthorization.additionalPersonnel.filter((_, i) => i !== index);

    updateAuthorization({
      ...currentAuthorization,
      additionalPersonnel: newPersonnel
    });
  }, [currentAuthorization, updateAuthorization]);

  // Add emergency contact
  const addEmergencyContact = useCallback(() => {
    const newContact: EmergencyContact = {
      contactInfo: { name: '', company: '', phone: '', email: '' },
      relationship: 'supervisor',
      availabilityHours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '17:00', closed: true },
        sunday: { open: '08:00', close: '17:00', closed: true }
      },
      escalationPriority: 1,
      communicationChannels: ['phone', 'email']
    };

    updateAuthorization({
      ...currentAuthorization,
      emergencyContacts: [...currentAuthorization.emergencyContacts, newContact]
    });
  }, [currentAuthorization, updateAuthorization]);

  // Get error for field
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  // Authorization level descriptions
  const authLevelDescriptions = {
    'full': 'Complete authority including package release, scheduling, and modifications',
    'limited': 'Package release authority only, no scheduling modifications',
    'witness-only': 'Can witness pickup but cannot authorize package release'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Level Indicator */}
      {isHighValue && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 mb-1">High-Value Shipment Security</h4>
                <p className="text-sm text-amber-800">
                  Enhanced security protocols required for shipments valued over $1,000. 
                  {isExtremeDriveValue && ' Dual authorization may be required for values over $5,000.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Authorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Primary Contact Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={currentAuthorization.primaryAuthorization.contactInfo.name}
                onChange={(e) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    primaryAuthorization: {
                      ...currentAuthorization.primaryAuthorization,
                      contactInfo: {
                        ...currentAuthorization.primaryAuthorization.contactInfo,
                        name: e.target.value
                      }
                    }
                  });
                }}
                placeholder="Primary contact name"
              />
              {getFieldError('primaryAuthorization.contactInfo.name') && (
                <div className="text-sm text-red-600 mt-1">
                  {getFieldError('primaryAuthorization.contactInfo.name')}
                </div>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={currentAuthorization.primaryAuthorization.contactInfo.phone}
                onChange={(e) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    primaryAuthorization: {
                      ...currentAuthorization.primaryAuthorization,
                      contactInfo: {
                        ...currentAuthorization.primaryAuthorization.contactInfo,
                        phone: e.target.value
                      }
                    }
                  });
                }}
                placeholder="+1 (555) 123-4567"
              />
              {getFieldError('primaryAuthorization.contactInfo.phone') && (
                <div className="text-sm text-red-600 mt-1">
                  {getFieldError('primaryAuthorization.contactInfo.phone')}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Authorization Level</Label>
              <Select
                value={currentAuthorization.primaryAuthorization.authorizationLevel}
                onValueChange={(value: 'full' | 'limited' | 'witness-only') => {
                  updateAuthorization({
                    ...currentAuthorization,
                    primaryAuthorization: {
                      ...currentAuthorization.primaryAuthorization,
                      authorizationLevel: value
                    }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Authority</SelectItem>
                  <SelectItem value="limited">Limited Authority</SelectItem>
                  <SelectItem value="witness-only">Witness Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                {authLevelDescriptions[currentAuthorization.primaryAuthorization.authorizationLevel]}
              </p>
            </div>
            <div>
              <Label>Relationship</Label>
              <Select
                value={currentAuthorization.primaryAuthorization.relationship}
                onValueChange={(value: string) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    primaryAuthorization: {
                      ...currentAuthorization.primaryAuthorization,
                      relationship: value
                    }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary-contact">Primary Contact</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={currentAuthorization.primaryAuthorization.idVerificationRequired}
                onCheckedChange={(checked) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    primaryAuthorization: {
                      ...currentAuthorization.primaryAuthorization,
                      idVerificationRequired: checked as boolean
                    }
                  });
                }}
                disabled={isHighValue} // Required for high-value
              />
              <div>
                <Label className="font-medium">ID Verification Required</Label>
                <p className="text-sm text-gray-600">
                  Government-issued photo ID must be verified
                  {isHighValue && ' (Required for high-value shipments)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={currentAuthorization.primaryAuthorization.signatureAuthority}
                onCheckedChange={(checked) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    primaryAuthorization: {
                      ...currentAuthorization.primaryAuthorization,
                      signatureAuthority: checked as boolean
                    }
                  });
                }}
              />
              <div>
                <Label className="font-medium">Signature Authority</Label>
                <p className="text-sm text-gray-600">
                  Authorized to sign pickup receipts and documentation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Authorized Personnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Additional Authorized Personnel
            </div>
            <Button variant="outline" size="sm" onClick={addAdditionalPersonnel}>
              <Plus className="h-4 w-4 mr-1" />
              Add Person
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentAuthorization.additionalPersonnel.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No additional personnel authorized</p>
              <p className="text-sm">Add people who can authorize package pickup on your behalf</p>
            </div>
          ) : (
            currentAuthorization.additionalPersonnel.map((person, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Additional Person #{index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdditionalPersonnel(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={person.contactInfo.name}
                      onChange={(e) => {
                        updateAdditionalPersonnel(index, {
                          contactInfo: { ...person.contactInfo, name: e.target.value }
                        });
                      }}
                      placeholder="Person name"
                    />
                    {getFieldError(`additionalPersonnel[${index}].contactInfo.name`) && (
                      <div className="text-sm text-red-600 mt-1">
                        {getFieldError(`additionalPersonnel[${index}].contactInfo.name`)}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={person.contactInfo.phone}
                      onChange={(e) => {
                        updateAdditionalPersonnel(index, {
                          contactInfo: { ...person.contactInfo, phone: e.target.value }
                        });
                      }}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Authorization Level</Label>
                    <Select
                      value={person.authorizationLevel}
                      onValueChange={(value: 'full' | 'limited' | 'witness-only') => {
                        updateAdditionalPersonnel(index, { authorizationLevel: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Authority</SelectItem>
                        <SelectItem value="limited">Limited Authority</SelectItem>
                        <SelectItem value="witness-only">Witness Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Select
                      value={person.relationship}
                      onValueChange={(value: string) => {
                        updateAdditionalPersonnel(index, { relationship: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="team-member">Team Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={person.idVerificationRequired}
                      onCheckedChange={(checked) => {
                        updateAdditionalPersonnel(index, { idVerificationRequired: checked as boolean });
                      }}
                    />
                    <Label className="text-sm">ID Verification</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={person.signatureAuthority}
                      onCheckedChange={(checked) => {
                        updateAdditionalPersonnel(index, { signatureAuthority: checked as boolean });
                      }}
                    />
                    <Label className="text-sm">Signature Authority</Label>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Universal Authorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Universal Authorization Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={currentAuthorization.universalAuthorization.anyoneAtLocation}
                onCheckedChange={(checked) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    universalAuthorization: {
                      ...currentAuthorization.universalAuthorization,
                      anyoneAtLocation: checked as boolean
                    }
                  });
                }}
              />
              <div>
                <Label className="font-medium">Anyone at Location</Label>
                <p className="text-sm text-gray-600">
                  Any authorized person at the pickup location can receive the package
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={currentAuthorization.universalAuthorization.departmentLevel}
                onCheckedChange={(checked) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    universalAuthorization: {
                      ...currentAuthorization.universalAuthorization,
                      departmentLevel: checked as boolean
                    }
                  });
                }}
              />
              <div className="flex-1">
                <Label className="font-medium">Department-Level Authorization</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Anyone from the specified department can authorize pickup
                </p>
                {currentAuthorization.universalAuthorization.departmentLevel && (
                  <Input
                    value={currentAuthorization.universalAuthorization.department || ''}
                    onChange={(e) => {
                      updateAuthorization({
                        ...currentAuthorization,
                        universalAuthorization: {
                          ...currentAuthorization.universalAuthorization,
                          department: e.target.value
                        }
                      });
                    }}
                    placeholder="Department name"
                    className="mt-2"
                  />
                )}
                {getFieldError('universalAuthorization.department') && (
                  <div className="text-sm text-red-600 mt-1">
                    {getFieldError('universalAuthorization.department')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={currentAuthorization.universalAuthorization.roleBasedAuth}
                onCheckedChange={(checked) => {
                  updateAuthorization({
                    ...currentAuthorization,
                    universalAuthorization: {
                      ...currentAuthorization.universalAuthorization,
                      roleBasedAuth: checked as boolean
                    }
                  });
                }}
              />
              <div className="flex-1">
                <Label className="font-medium">Role-Based Authorization</Label>
                <p className="text-sm text-gray-600 mb-2">
                  People with specific job roles can authorize pickup
                </p>
                {currentAuthorization.universalAuthorization.roleBasedAuth && (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add role (e.g., Manager, Supervisor)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value && !currentAuthorization.universalAuthorization.allowedRoles.includes(value)) {
                              updateAuthorization({
                                ...currentAuthorization,
                                universalAuthorization: {
                                  ...currentAuthorization.universalAuthorization,
                                  allowedRoles: [...currentAuthorization.universalAuthorization.allowedRoles, value]
                                }
                              });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentAuthorization.universalAuthorization.allowedRoles.map((role, roleIndex) => (
                        <Badge key={roleIndex} variant="secondary" className="flex items-center gap-1">
                          {role}
                          <button
                            onClick={() => {
                              const newRoles = currentAuthorization.universalAuthorization.allowedRoles.filter((_, i) => i !== roleIndex);
                              updateAuthorization({
                                ...currentAuthorization,
                                universalAuthorization: {
                                  ...currentAuthorization.universalAuthorization,
                                  allowedRoles: newRoles
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {getFieldError('universalAuthorization.allowedRoles') && (
                  <div className="text-sm text-red-600 mt-1">
                    {getFieldError('universalAuthorization.allowedRoles')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />
              Emergency Contacts
            </div>
            <Button variant="outline" size="sm" onClick={addEmergencyContact}>
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAuthorization.emergencyContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No emergency contacts configured</p>
              <p className="text-sm">Add contacts for emergency authorization escalation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentAuthorization.emergencyContacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Emergency Contact #{index + 1}</h4>
                    <Badge>Priority {contact.escalationPriority}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={contact.contactInfo.name}
                        onChange={(e) => {
                          const newContacts = [...currentAuthorization.emergencyContacts];
                          newContacts[index] = {
                            ...newContacts[index],
                            contactInfo: { ...newContacts[index].contactInfo, name: e.target.value }
                          };
                          updateAuthorization({
                            ...currentAuthorization,
                            emergencyContacts: newContacts
                          });
                        }}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={contact.contactInfo.phone}
                        onChange={(e) => {
                          const newContacts = [...currentAuthorization.emergencyContacts];
                          newContacts[index] = {
                            ...newContacts[index],
                            contactInfo: { ...newContacts[index].contactInfo, phone: e.target.value }
                          };
                          updateAuthorization({
                            ...currentAuthorization,
                            emergencyContacts: newContacts
                          });
                        }}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Relationship</Label>
                      <Select
                        value={contact.relationship}
                        onValueChange={(value: string) => {
                          const newContacts = [...currentAuthorization.emergencyContacts];
                          newContacts[index] = { ...newContacts[index], relationship: value };
                          updateAuthorization({
                            ...currentAuthorization,
                            emergencyContacts: newContacts
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={contact.escalationPriority.toString()}
                        onValueChange={(value: string) => {
                          const newContacts = [...currentAuthorization.emergencyContacts];
                          newContacts[index] = { ...newContacts[index], escalationPriority: parseInt(value) };
                          updateAuthorization({
                            ...currentAuthorization,
                            emergencyContacts: newContacts
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Priority 1 (First Contact)</SelectItem>
                          <SelectItem value="2">Priority 2</SelectItem>
                          <SelectItem value="3">Priority 3</SelectItem>
                          <SelectItem value="4">Priority 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
