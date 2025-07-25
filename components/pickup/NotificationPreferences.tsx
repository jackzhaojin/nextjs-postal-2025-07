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
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Settings,
  Smartphone,
  Users
} from 'lucide-react';
import { 
  type PickupNotificationPreferences, 
  ReminderSettings, 
  UpdateSettings, 
  ChannelPreference, 
  EscalationSetting,
  CommunicationChannel,
  ContactInfo,
  BusinessHours,
  ValidationError 
} from '@/lib/types';

interface NotificationPreferencesProps {
  preferences?: PickupNotificationPreferences;
  onPreferencesUpdate: (preferences: PickupNotificationPreferences) => void;
  contactInfo: ContactInfo[];
  pickupSchedule?: { date: string; timeSlot: { startTime: string; endTime: string; } };
  availableChannels: CommunicationChannel[];
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
}

/**
 * NotificationPreferences Component
 * 
 * Comprehensive notification management for pickup scheduling with:
 * - Multi-channel communication preferences
 * - Pickup reminder configuration  
 * - Real-time update notifications
 * - Business hours consideration
 * - Emergency escalation procedures
 * - Contact-specific preferences
 */
export function NotificationPreferences({
  preferences,
  onPreferencesUpdate,
  contactInfo,
  pickupSchedule,
  availableChannels = ['email', 'sms', 'phone'],
  onValidation,
  className = ''
}: NotificationPreferencesProps) {
  console.log('🔔 [NOTIFICATION-PREFERENCES] Rendering notification preferences');

  // Default notification preferences
  const defaultPreferences: PickupNotificationPreferences = {
    emailReminder24h: true,
    smsReminder2h: true,
    callReminder30m: false,
    driverEnRoute: true,
    pickupCompletion: true,
    transitUpdates: true,
    pickupReminders: [
      {
        type: 'pickup-24h',
        enabled: true,
        timing: 1440, // 24 hours
        channels: ['email'],
        customMessage: ''
      },
      {
        type: 'pickup-2h',
        enabled: true,
        timing: 120, // 2 hours
        channels: ['sms'],
        customMessage: ''
      },
      {
        type: 'pickup-30m',
        enabled: false,
        timing: 30, // 30 minutes
        channels: ['phone'],
        customMessage: ''
      }
    ],
    realTimeUpdates: [
      {
        type: 'driver-enroute',
        enabled: true,
        channels: ['sms', 'email'],
        frequency: 'immediate'
      },
      {
        type: 'pickup-completion',
        enabled: true,
        channels: ['email'],
        frequency: 'immediate'
      },
      {
        type: 'package-transit',
        enabled: true,
        channels: ['email'],
        frequency: 'milestone'
      },
      {
        type: 'delivery-confirmation',
        enabled: true,
        channels: ['email', 'sms'],
        frequency: 'immediate'
      }
    ],
    communicationChannels: availableChannels.map((channel, index) => ({
      channel,
      primary: index === 0,
      businessHoursOnly: channel === 'phone',
      contactInfo: contactInfo[0]?.email || contactInfo[0]?.phone || '',
      fallbackOrder: index + 1
    })),
    escalationProcedures: [],
    businessHoursOnly: false
  };

  const [currentPreferences, setCurrentPreferences] = useState<PickupNotificationPreferences>(
    preferences || defaultPreferences
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'failed'>>({});

  // Update preferences when prop changes
  useEffect(() => {
    if (preferences) {
      console.log('🔔 [NOTIFICATION-PREFERENCES] Updating preferences from props');
      setCurrentPreferences(preferences);
    }
  }, [preferences]);

  // Validation logic
  const validatePreferences = useCallback((prefs: PickupNotificationPreferences): ValidationError[] => {
    const errors: ValidationError[] = [];

    // At least one reminder should be enabled
    const hasEnabledReminder = prefs.pickupReminders.some(r => r.enabled);
    if (!hasEnabledReminder) {
      errors.push({
        field: 'pickupReminders',
        message: 'At least one pickup reminder must be enabled',
        code: 'REMINDER_REQUIRED'
      });
    }

    // Validate communication channels have contact info
    prefs.communicationChannels.forEach((channel, index) => {
      if (!channel.contactInfo.trim()) {
        errors.push({
          field: `communicationChannels[${index}].contactInfo`,
          message: `Contact information required for ${channel.channel}`,
          code: 'CONTACT_INFO_REQUIRED'
        });
      }

      // Validate email format
      if (channel.channel === 'email' && channel.contactInfo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(channel.contactInfo)) {
          errors.push({
            field: `communicationChannels[${index}].contactInfo`,
            message: 'Invalid email format',
            code: 'INVALID_EMAIL'
          });
        }
      }

      // Validate phone format
      if ((channel.channel === 'sms' || channel.channel === 'phone') && channel.contactInfo) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(channel.contactInfo)) {
          errors.push({
            field: `communicationChannels[${index}].contactInfo`,
            message: 'Invalid phone number format',
            code: 'INVALID_PHONE'
          });
        }
      }
    });

    // Must have at least one primary channel
    const hasPrimaryChannel = prefs.communicationChannels.some(c => c.primary);
    if (!hasPrimaryChannel) {
      errors.push({
        field: 'communicationChannels',
        message: 'At least one communication channel must be marked as primary',
        code: 'PRIMARY_CHANNEL_REQUIRED'
      });
    }

    return errors;
  }, []);

  // Update preferences and validate
  const updatePreferences = useCallback((newPreferences: PickupNotificationPreferences) => {
    console.log('🔔 [NOTIFICATION-PREFERENCES] Updating preferences:', newPreferences);
    
    setCurrentPreferences(newPreferences);
    const errors = validatePreferences(newPreferences);
    setValidationErrors(errors);
    
    if (onValidation) {
      onValidation(errors.length === 0, errors);
    }
    
    onPreferencesUpdate(newPreferences);
  }, [onPreferencesUpdate, validatePreferences, onValidation]);

  // Handle reminder settings change
  const updateReminderSetting = useCallback((index: number, updates: Partial<ReminderSettings>) => {
    const newReminders = [...currentPreferences.pickupReminders];
    newReminders[index] = { ...newReminders[index], ...updates };
    
    updatePreferences({
      ...currentPreferences,
      pickupReminders: newReminders
    });
  }, [currentPreferences, updatePreferences]);

  // Handle real-time update settings change
  const updateRealTimeUpdate = useCallback((index: number, updates: Partial<UpdateSettings>) => {
    const newUpdates = [...currentPreferences.realTimeUpdates];
    newUpdates[index] = { ...newUpdates[index], ...updates };
    
    updatePreferences({
      ...currentPreferences,
      realTimeUpdates: newUpdates
    });
  }, [currentPreferences, updatePreferences]);

  // Handle communication channel change
  const updateCommunicationChannel = useCallback((index: number, updates: Partial<ChannelPreference>) => {
    const newChannels = [...currentPreferences.communicationChannels];
    newChannels[index] = { ...newChannels[index], ...updates };
    
    // If setting as primary, unset others
    if (updates.primary === true) {
      newChannels.forEach((channel, i) => {
        if (i !== index) {
          channel.primary = false;
        }
      });
    }
    
    updatePreferences({
      ...currentPreferences,
      communicationChannels: newChannels
    });
  }, [currentPreferences, updatePreferences]);

  // Test notification functionality
  const testNotification = useCallback(async (channel: CommunicationChannel) => {
    console.log('🔔 [NOTIFICATION-PREFERENCES] Testing notification channel:', channel);
    
    setTestResults(prev => ({ ...prev, [channel]: 'pending' }));
    
    // Simulate API call for testing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResults(prev => ({ ...prev, [channel]: 'success' }));
    } catch (error) {
      console.error('❌ [NOTIFICATION-PREFERENCES] Test failed:', error);
      setTestResults(prev => ({ ...prev, [channel]: 'failed' }));
    }
  }, []);

  // Channel icon mapping
  const getChannelIcon = (channel: CommunicationChannel) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Get error for field
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pickup Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Pickup Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPreferences.pickupReminders.map((reminder, index) => (
            <div key={reminder.type} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => {
                      updateReminderSetting(index, { enabled: checked as boolean });
                    }}
                  />
                  <Label className="font-medium">
                    {reminder.type === 'pickup-24h' && 'Email Reminder (24 hours before)'}
                    {reminder.type === 'pickup-2h' && 'SMS Reminder (2 hours before)'}
                    {reminder.type === 'pickup-30m' && 'Phone Call Reminder (30 minutes before)'}
                    {reminder.type === 'preparation' && 'Preparation Reminder'}
                  </Label>
                </div>
                {reminder.enabled && (
                  <Badge variant="secondary">
                    {Math.floor(reminder.timing / 60)}h {reminder.timing % 60}m before
                  </Badge>
                )}
              </div>

              {reminder.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-gray-600">Timing (minutes before pickup)</Label>
                      <Input
                        type="number"
                        value={reminder.timing}
                        onChange={(e) => {
                          updateReminderSetting(index, { timing: parseInt(e.target.value) || 0 });
                        }}
                        min="5"
                        max="2880"
                        placeholder="Minutes before pickup"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Channels</Label>
                      <div className="flex gap-2 mt-1">
                        {availableChannels.map(channel => (
                          <Button
                            key={channel}
                            variant={reminder.channels.includes(channel) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newChannels = reminder.channels.includes(channel)
                                ? reminder.channels.filter(c => c !== channel)
                                : [...reminder.channels, channel];
                              updateReminderSetting(index, { channels: newChannels });
                            }}
                          >
                            {getChannelIcon(channel)}
                            <span className="ml-1 capitalize">{channel}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {reminder.customMessage !== undefined && (
                    <div>
                      <Label className="text-sm text-gray-600">Custom Message (optional)</Label>
                      <Textarea
                        value={reminder.customMessage}
                        onChange={(e) => {
                          updateReminderSetting(index, { customMessage: e.target.value });
                        }}
                        placeholder="Custom reminder message..."
                        rows={2}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {getFieldError('pickupReminders') && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('pickupReminders')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Real-Time Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPreferences.realTimeUpdates.map((update, index) => (
            <div key={update.type} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={update.enabled}
                    onCheckedChange={(checked) => {
                      updateRealTimeUpdate(index, { enabled: checked as boolean });
                    }}
                  />
                  <Label className="font-medium">
                    {update.type === 'driver-enroute' && 'Driver En Route'}
                    {update.type === 'pickup-completion' && 'Pickup Completion'}
                    {update.type === 'package-transit' && 'Package in Transit'}
                    {update.type === 'delivery-confirmation' && 'Delivery Confirmation'}
                  </Label>
                </div>
                {update.enabled && (
                  <Badge variant="outline">
                    {update.frequency}
                  </Badge>
                )}
              </div>

              {update.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">Channels</Label>
                    <div className="flex gap-2 mt-1">
                      {availableChannels.map(channel => (
                        <Button
                          key={channel}
                          variant={update.channels.includes(channel) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newChannels = update.channels.includes(channel)
                              ? update.channels.filter(c => c !== channel)
                              : [...update.channels, channel];
                            updateRealTimeUpdate(index, { channels: newChannels });
                          }}
                        >
                          {getChannelIcon(channel)}
                          <span className="ml-1 capitalize">{channel}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Frequency</Label>
                    <Select
                      value={update.frequency}
                      onValueChange={(value: 'immediate' | 'periodic' | 'milestone') => {
                        updateRealTimeUpdate(index, { frequency: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="periodic">Periodic</SelectItem>
                        <SelectItem value="milestone">Milestone Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Communication Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Communication Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPreferences.communicationChannels.map((channel, index) => (
            <div key={`${channel.channel}-${index}`} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.channel)}
                  <Label className="font-medium capitalize">{channel.channel}</Label>
                  {channel.primary && (
                    <Badge variant="default">Primary</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={channel.primary}
                    onCheckedChange={(checked) => {
                      updateCommunicationChannel(index, { primary: checked as boolean });
                    }}
                  />
                  <Label className="text-sm">Primary</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-600">
                    {channel.channel === 'email' ? 'Email Address' : 'Phone Number'}
                  </Label>
                  <Input
                    value={channel.contactInfo}
                    onChange={(e) => {
                      updateCommunicationChannel(index, { contactInfo: e.target.value });
                    }}
                    placeholder={
                      channel.channel === 'email' 
                        ? 'contact@company.com' 
                        : '+1 (555) 123-4567'
                    }
                    type={channel.channel === 'email' ? 'email' : 'tel'}
                  />
                  {getFieldError(`communicationChannels[${index}].contactInfo`) && (
                    <div className="text-sm text-red-600 mt-1">
                      {getFieldError(`communicationChannels[${index}].contactInfo`)}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={channel.businessHoursOnly}
                      onCheckedChange={(checked) => {
                        updateCommunicationChannel(index, { businessHoursOnly: checked as boolean });
                      }}
                    />
                    <Label className="text-sm">Business hours only</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification(channel.channel)}
                    disabled={testResults[channel.channel] === 'pending' || !channel.contactInfo}
                  >
                    {testResults[channel.channel] === 'pending' && 'Testing...'}
                    {testResults[channel.channel] === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {testResults[channel.channel] === 'failed' && <AlertCircle className="h-4 w-4 text-red-600" />}
                    {!testResults[channel.channel] && 'Test'}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {getFieldError('communicationChannels') && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('communicationChannels')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={currentPreferences.businessHoursOnly}
              onCheckedChange={(checked) => {
                updatePreferences({
                  ...currentPreferences,
                  businessHoursOnly: checked as boolean
                });
              }}
            />
            <div>
              <Label className="font-medium">Restrict to business hours only</Label>
              <p className="text-sm text-gray-600">
                Notifications will only be sent during business hours (8 AM - 6 PM, Monday-Friday)
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
                <h4 className="font-medium text-red-900 mb-2">Please fix the following issues:</h4>
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
