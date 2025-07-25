'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Shield, 
  Package, 
  Star, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Save,
  Settings
} from 'lucide-react';
import { NotificationPreferences } from './NotificationPreferences';
import { PackageReadiness } from './PackageReadiness';
import { AuthorizationManagement } from './AuthorizationManagement';
import { PremiumServices } from './PremiumServices';
import { 
  type NotificationPreferences as NotificationPreferencesType, 
  PackageReadinessSettings, 
  AuthorizationSettings, 
  PremiumServiceOptions,
  SecurityProtocol,
  ContactInfo,
  PackageInfo,
  ValidationError,
  CommunicationChannel
} from '@/lib/types';

interface NotificationAuthorizationFormProps {
  notificationPreferences?: NotificationPreferencesType;
  packageReadiness?: PackageReadinessSettings;
  authorizationSettings?: AuthorizationSettings;
  premiumServices?: PremiumServiceOptions;
  packageInfo: PackageInfo;
  contactInfo: ContactInfo[];
  pickupSchedule?: { date: string; timeSlot: { startTime: string; endTime: string; } };
  serviceArea: 'full' | 'limited' | 'major-cities';
  onDataUpdate: (data: {
    notificationPreferences: NotificationPreferencesType;
    packageReadiness: PackageReadinessSettings;
    authorizationSettings: AuthorizationSettings;
    premiumServices: PremiumServiceOptions;
  }) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  validationErrors?: ValidationError[];
  className?: string;
}

/**
 * NotificationAuthorizationForm Component
 * 
 * Master component that orchestrates notification preferences, package readiness,
 * authorization management, and premium services for pickup scheduling.
 * 
 * Features:
 * - Tabbed interface for organized workflow
 * - Real-time validation across all sections
 * - Progress tracking and completion indicators
 * - Auto-save functionality with persistence
 * - Cross-section data coordination
 * - Mobile-responsive design
 */
export function NotificationAuthorizationForm({
  notificationPreferences,
  packageReadiness,
  authorizationSettings,
  premiumServices,
  packageInfo,
  contactInfo,
  pickupSchedule,
  serviceArea,
  onDataUpdate,
  onSave,
  isSaving = false,
  validationErrors = [],
  className = ''
}: NotificationAuthorizationFormProps) {
  console.log('🔔🛡️ [NOTIFICATION-AUTHORIZATION-FORM] Rendering master form');
  console.log('🔔🛡️ [NOTIFICATION-AUTHORIZATION-FORM] Props received:', {
    hasNotificationPreferences: !!notificationPreferences,
    hasPackageReadiness: !!packageReadiness,
    hasAuthorizationSettings: !!authorizationSettings,
    hasPremiumServices: !!premiumServices,
    packageInfo: packageInfo,
    contactInfoCount: contactInfo?.length || 0,
    hasPickupSchedule: !!pickupSchedule,
    serviceArea
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [sectionValidation, setSectionValidation] = useState({
    notifications: { isValid: false, errors: [] as ValidationError[] },
    readiness: { isValid: false, errors: [] as ValidationError[] },
    authorization: { isValid: false, errors: [] as ValidationError[] },
    premium: { isValid: true, errors: [] as ValidationError[] }
  });

  // Available communication channels
  const availableChannels: CommunicationChannel[] = ['email', 'sms', 'phone'];

  // Security requirements based on package value - add safety check
  let securityRequirements: SecurityProtocol[];
  try {
    const declaredValue = packageInfo?.declaredValue || 0;
    console.log('🔔🛡️ [NOTIFICATION-AUTHORIZATION-FORM] Package declared value:', declaredValue);
    
    securityRequirements = declaredValue > 1000 ? [
      {
        type: 'high-value',
        idVerificationRequired: true,
        photoIdMatching: true,
        dualAuthorization: declaredValue > 5000,
        insuranceRequired: true,
        auditTrailRequired: true,
        customRequirements: ['Enhanced security protocols', 'Photo documentation required']
      }
    ] : [
      {
        type: 'standard',
        idVerificationRequired: false,
        photoIdMatching: false,
        dualAuthorization: false,
        insuranceRequired: false,
        auditTrailRequired: false,
        customRequirements: []
      }
    ];
  } catch (error) {
    console.error('🔔🛡️ [NOTIFICATION-AUTHORIZATION-FORM] Error processing package info:', error);
    securityRequirements = [
      {
        type: 'standard',
        idVerificationRequired: false,
        photoIdMatching: false,
        dualAuthorization: false,
        insuranceRequired: false,
        auditTrailRequired: false,
        customRequirements: []
      }
    ];
  }

  // Current form data state
  const [formData, setFormData] = useState({
    notificationPreferences: notificationPreferences || {} as NotificationPreferencesType,
    packageReadiness: packageReadiness || {} as PackageReadinessSettings,
    authorizationSettings: authorizationSettings || {} as AuthorizationSettings,
    premiumServices: premiumServices || {} as PremiumServiceOptions
  });

  // Update form data when props change
  useEffect(() => {
    setFormData({
      notificationPreferences: notificationPreferences || {} as NotificationPreferencesType,
      packageReadiness: packageReadiness || {} as PackageReadinessSettings,
      authorizationSettings: authorizationSettings || {} as AuthorizationSettings,
      premiumServices: premiumServices || {} as PremiumServiceOptions
    });
  }, [notificationPreferences, packageReadiness, authorizationSettings, premiumServices]);

  // Handle notification preferences update
  const handleNotificationUpdate = useCallback((preferences: NotificationPreferencesType) => {
    console.log('🔔 [NOTIFICATION-AUTHORIZATION-FORM] Notification preferences updated');
    
    const newFormData = {
      ...formData,
      notificationPreferences: preferences
    };
    setFormData(newFormData);
    onDataUpdate(newFormData);
  }, [formData, onDataUpdate]);

  // Handle package readiness update
  const handleReadinessUpdate = useCallback((readiness: PackageReadinessSettings) => {
    console.log('📦 [NOTIFICATION-AUTHORIZATION-FORM] Package readiness updated');
    
    const newFormData = {
      ...formData,
      packageReadiness: readiness
    };
    setFormData(newFormData);
    onDataUpdate(newFormData);
  }, [formData, onDataUpdate]);

  // Handle authorization settings update
  const handleAuthorizationUpdate = useCallback((authorization: AuthorizationSettings) => {
    console.log('🛡️ [NOTIFICATION-AUTHORIZATION-FORM] Authorization settings updated');
    
    const newFormData = {
      ...formData,
      authorizationSettings: authorization
    };
    setFormData(newFormData);
    onDataUpdate(newFormData);
  }, [formData, onDataUpdate]);

  // Handle premium services update
  const handlePremiumServicesUpdate = useCallback((services: PremiumServiceOptions) => {
    console.log('⭐ [NOTIFICATION-AUTHORIZATION-FORM] Premium services updated');
    
    const newFormData = {
      ...formData,
      premiumServices: services
    };
    setFormData(newFormData);
    onDataUpdate(newFormData);
  }, [formData, onDataUpdate]);

  // Handle section validation
  const handleSectionValidation = useCallback((
    section: keyof typeof sectionValidation,
    isValid: boolean,
    errors: ValidationError[]
  ) => {
    console.log(`🔔🛡️ [NOTIFICATION-AUTHORIZATION-FORM] Section ${section} validation:`, { isValid, errorCount: errors.length });
    
    setSectionValidation(prev => ({
      ...prev,
      [section]: { isValid, errors }
    }));
  }, []);

  // Calculate overall completion percentage
  const calculateCompletionPercentage = useCallback(() => {
    const sections = Object.values(sectionValidation);
    const completedSections = sections.filter(section => section.isValid).length;
    return Math.round((completedSections / sections.length) * 100);
  }, [sectionValidation]);

  // Check if form is ready for submission
  const isFormValid = Object.values(sectionValidation).every(section => section.isValid);

  // Get tab validation status
  const getTabStatus = (tabKey: keyof typeof sectionValidation) => {
    const validation = sectionValidation[tabKey];
    if (validation.isValid) return 'completed';
    if (validation.errors.length > 0) return 'error';
    return 'pending';
  };

  // Get status icon for tab
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status color for tab
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 border-green-200';
      case 'error':
        return 'text-red-600 border-red-200';
      default:
        return 'text-gray-600 border-gray-200';
    }
  };

  // Tab definitions with metadata
  const tabs = [
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'Communication preferences and reminders'
    },
    {
      key: 'readiness',
      label: 'Package Readiness',
      icon: <Package className="h-4 w-4" />,
      description: 'Preparation timing and checklist'
    },
    {
      key: 'authorization',
      label: 'Authorization',
      icon: <Shield className="h-4 w-4" />,
      description: 'Personnel and security settings'
    },
    {
      key: 'premium',
      label: 'Premium Services',
      icon: <Star className="h-4 w-4" />,
      description: 'Weekend, holiday, and special options'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notification & Authorization Settings
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {calculateCompletionPercentage()}% Complete
              </div>
              <Progress value={calculateCompletionPercentage()} className="w-24" />
              {isFormValid && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Ready
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabs.map(tab => {
              const status = getTabStatus(tab.key as keyof typeof sectionValidation);
              return (
                <div
                  key={tab.key}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    activeTab === tab.key 
                      ? 'border-blue-300 bg-blue-50' 
                      : getStatusColor(status)
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {tab.icon}
                    {getStatusIcon(status)}
                  </div>
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className="text-xs text-gray-600">{tab.description}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map(tab => {
            const status = getTabStatus(tab.key as keyof typeof sectionValidation);
            return (
              <TabsTrigger 
                key={tab.key} 
                value={tab.key}
                className="flex items-center gap-2"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                {status === 'error' && <AlertCircle className="h-3 w-3 text-red-600" />}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationPreferences
            preferences={formData.notificationPreferences}
            onPreferencesUpdate={handleNotificationUpdate}
            contactInfo={contactInfo}
            pickupSchedule={pickupSchedule}
            availableChannels={availableChannels}
            onValidation={(isValid, errors) => handleSectionValidation('notifications', isValid, errors)}
          />
        </TabsContent>

        <TabsContent value="readiness" className="space-y-6">
          <PackageReadiness
            readiness={formData.packageReadiness}
            onReadinessUpdate={handleReadinessUpdate}
            packageInfo={packageInfo}
            pickupSchedule={pickupSchedule}
            onValidation={(isValid, errors) => handleSectionValidation('readiness', isValid, errors)}
          />
        </TabsContent>

        <TabsContent value="authorization" className="space-y-6">
          <AuthorizationManagement
            authorization={formData.authorizationSettings}
            onAuthorizationUpdate={handleAuthorizationUpdate}
            packageValue={packageInfo.declaredValue}
            securityRequirements={securityRequirements}
            contactInfo={contactInfo[0] || { name: '', company: '', phone: '', email: '' }}
            onValidation={(isValid, errors) => handleSectionValidation('authorization', isValid, errors)}
          />
        </TabsContent>

        <TabsContent value="premium" className="space-y-6">
          <PremiumServices
            services={formData.premiumServices}
            onServicesUpdate={handlePremiumServicesUpdate}
            pickupDate={pickupSchedule?.date}
            serviceArea={serviceArea}
            onValidation={(isValid, errors) => handleSectionValidation('premium', isValid, errors)}
          />
        </TabsContent>
      </Tabs>

      {/* Validation Summary */}
      {Object.values(sectionValidation).some(section => section.errors.length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Validation Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(sectionValidation).map(([sectionKey, validation]) => (
              validation.errors.length > 0 && (
                <div key={sectionKey} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-red-900 mb-2 capitalize">
                    {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isFormValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  All sections completed successfully
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Complete all sections to proceed
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {onSave && (
                <Button
                  variant="outline"
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Progress'}
                </Button>
              )}
              <Button
                disabled={!isFormValid}
                className="flex items-center gap-2"
              >
                Continue to Review
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
