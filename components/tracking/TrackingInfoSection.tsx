'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Truck,
  Clock,
  ExternalLink,
  Bell,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  Smartphone,
  Copy,
  RefreshCw
} from 'lucide-react';
import {
  TrackingInformation,
  TrackingStatus,
  TrackingMilestone,
  TrackingNotificationPreferences,
  ShippingTransaction
} from '@/lib/types';

interface TrackingInfoSectionProps {
  transaction: ShippingTransaction;
  onUpdateNotificationPrefs?: (prefs: TrackingNotificationPreferences) => void;
}

export function TrackingInfoSection({ 
  transaction, 
  onUpdateNotificationPrefs 
}: TrackingInfoSectionProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInformation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('TrackingInfoSection - Initializing tracking info for transaction:', transaction.id);
    generateMockTrackingInfo();
  }, [transaction.id]);

  const generateMockTrackingInfo = () => {
    console.log('TrackingInfoSection - Generating mock tracking information');
    
    // Mock tracking number - simulate 2-4 hour delay for real tracking number
    const now = new Date();
    const estimatedAvailability = new Date(now.getTime() + (2.5 * 60 * 60 * 1000)); // 2.5 hours from now
    const hasTrackingNumber = now > estimatedAvailability;
    
    const trackingNumber = hasTrackingNumber ? 
      `1Z${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(Math.random() * 100000000)}` : 
      null;

    const mockTrackingInfo: TrackingInformation = {
      trackingNumber,
      estimatedAvailability,
      carrierTrackingUrl: trackingNumber ? 
        `https://www.ups.com/track?tracknum=${trackingNumber}` : 
        null,
      trackingStatus: {
        currentStatus: hasTrackingNumber ? 'in-transit' : 'pending',
        statusDescription: hasTrackingNumber ? 
          'Package has been picked up and is in transit' : 
          'Tracking number will be provided after pickup (2-4 hours)',
        lastUpdated: now,
        nextUpdate: hasTrackingNumber ? 
          new Date(now.getTime() + (4 * 60 * 60 * 1000)) : 
          estimatedAvailability,
        deliveryConfirmation: null
      },
      milestones: generateMockMilestones(hasTrackingNumber),
      notificationPreferences: {
        email: {
          enabled: true,
          address: transaction.shipmentDetails.origin.contactInfo.email,
          milestones: ['pickup', 'in-transit', 'out-for-delivery', 'delivered'],
          frequency: 'major'
        },
        sms: {
          enabled: false,
          phoneNumber: transaction.shipmentDetails.origin.contactInfo.phone,
          milestones: ['out-for-delivery', 'delivered']
        },
        push: {
          enabled: false,
          milestones: ['all']
        }
      }
    };

    setTrackingInfo(mockTrackingInfo);
    console.log('TrackingInfoSection - Mock tracking info generated:', mockTrackingInfo);
  };

  const generateMockMilestones = (hasTrackingNumber: boolean): TrackingMilestone[] => {
    if (!hasTrackingNumber) {
      return [];
    }

    const now = new Date();
    return [
      {
        id: '1',
        status: 'Label Created',
        description: 'Shipping label has been created and is ready for pickup',
        timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
        location: transaction.shipmentDetails.origin.city + ', ' + transaction.shipmentDetails.origin.state,
        facility: 'Origin Facility'
      },
      {
        id: '2',
        status: 'Package Picked Up',
        description: 'Package has been picked up by carrier',
        timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000)),
        location: transaction.shipmentDetails.origin.city + ', ' + transaction.shipmentDetails.origin.state,
        facility: 'Local Pickup'
      },
      {
        id: '3',
        status: 'In Transit',
        description: 'Package is in transit to destination',
        timestamp: new Date(now.getTime() - (30 * 60 * 1000)),
        location: 'Distribution Center',
        facility: 'Regional Hub'
      }
    ];
  };

  const handleCopyTrackingNumber = async () => {
    if (!trackingInfo?.trackingNumber) return;
    
    try {
      await navigator.clipboard.writeText(trackingInfo.trackingNumber);
      setCopied(true);
      console.log('TrackingInfoSection - Tracking number copied:', trackingInfo.trackingNumber);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('TrackingInfoSection - Failed to copy tracking number:', error);
    }
  };

  const handleRefreshTracking = async () => {
    setIsRefreshing(true);
    console.log('TrackingInfoSection - Refreshing tracking information');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateMockTrackingInfo();
    
    setIsRefreshing(false);
    console.log('TrackingInfoSection - Tracking information refreshed');
  };

  const handleUpdateNotificationPref = (
    type: 'email' | 'sms' | 'push',
    field: string,
    value: any
  ) => {
    if (!trackingInfo || !onUpdateNotificationPrefs) return;

    console.log('TrackingInfoSection - Updating notification preference:', { type, field, value });

    const updatedPrefs = {
      ...trackingInfo.notificationPreferences,
      [type]: {
        ...trackingInfo.notificationPreferences[type],
        [field]: value
      }
    };

    const updatedTrackingInfo = {
      ...trackingInfo,
      notificationPreferences: updatedPrefs
    };

    setTrackingInfo(updatedTrackingInfo);
    onUpdateNotificationPrefs(updatedPrefs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in-transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'out-for-delivery':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'exception':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in-transit':
        return 'default';
      case 'out-for-delivery':
        return 'default';
      case 'delivered':
        return 'default';
      case 'exception':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!trackingInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tracking Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading tracking information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="tracking-info-section">
      {/* Tracking Number and Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tracking Information
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshTracking}
              disabled={isRefreshing}
              className="ml-auto"
              data-testid="refresh-tracking-button"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between" data-testid="tracking-status">
            <div className="flex items-center gap-3">
              {getStatusIcon(trackingInfo.trackingStatus.currentStatus)}
              <div>
                <Badge variant={getStatusBadgeVariant(trackingInfo.trackingStatus.currentStatus)}>
                  {trackingInfo.trackingStatus.currentStatus.toUpperCase().replace('-', ' ')}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {trackingInfo.trackingStatus.statusDescription}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Last Updated</p>
              <p>{trackingInfo.trackingStatus.lastUpdated.toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          {/* Tracking Number */}
          <div className="space-y-2">
            <Label>Tracking Number</Label>
            {trackingInfo.trackingNumber ? (
              <div className="flex items-center gap-2">
                <Input
                  value={trackingInfo.trackingNumber}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTrackingNumber}
                  disabled={copied}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {trackingInfo.carrierTrackingUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(trackingInfo.carrierTrackingUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md" data-testid="tracking-number-placeholder">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Tracking number will be available after pickup
                  </p>
                  <p className="text-xs text-yellow-600" data-testid="tracking-availability-time">
                    Estimated availability: {trackingInfo.estimatedAvailability.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Next Update */}
          {trackingInfo.trackingStatus.nextUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Next update expected: {trackingInfo.trackingStatus.nextUpdate.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Milestones */}
      {trackingInfo.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tracking History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingInfo.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    {index < trackingInfo.milestones.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{milestone.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{milestone.location}</span>
                          {milestone.facility && (
                            <>
                              <span>•</span>
                              <span>{milestone.facility}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{milestone.timestamp.toLocaleDateString()}</p>
                        <p>{milestone.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label>Email Notifications</Label>
              </div>
              <Switch
                checked={trackingInfo.notificationPreferences.email.enabled}
                onCheckedChange={(checked) => 
                  handleUpdateNotificationPref('email', 'enabled', checked)
                }
                data-testid="email-notifications-toggle"
              />
            </div>
            
            {trackingInfo.notificationPreferences.email.enabled && (
              <div className="space-y-2 ml-6">
                <div>
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={trackingInfo.notificationPreferences.email.address}
                    onChange={(e) => 
                      handleUpdateNotificationPref('email', 'address', e.target.value)
                    }
                    data-testid="email-address-input"
                  />
                </div>
                <div>
                  <Label>Notification Frequency</Label>
                  <select
                    className="w-full mt-1 p-2 border border-input rounded-md"
                    value={trackingInfo.notificationPreferences.email.frequency}
                    onChange={(e) => 
                      handleUpdateNotificationPref('email', 'frequency', e.target.value)
                    }
                    data-testid="email-frequency-select"
                  >
                    <option value="all">All updates</option>
                    <option value="major">Major milestones only</option>
                    <option value="delivery-only">Delivery notification only</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SMS Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label>SMS Notifications</Label>
              </div>
              <Switch
                checked={trackingInfo.notificationPreferences.sms.enabled}
                onCheckedChange={(checked) => 
                  handleUpdateNotificationPref('sms', 'enabled', checked)
                }
                data-testid="sms-notifications-toggle"
              />
            </div>
            
            {trackingInfo.notificationPreferences.sms.enabled && (
              <div className="ml-6">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={trackingInfo.notificationPreferences.sms.phoneNumber}
                  onChange={(e) => 
                    handleUpdateNotificationPref('sms', 'phoneNumber', e.target.value)
                  }
                  placeholder="(555) 123-4567"
                  data-testid="phone-number-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Standard messaging rates may apply
                </p>
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Label>Push Notifications</Label>
              </div>
              <Switch
                checked={trackingInfo.notificationPreferences.push.enabled}
                onCheckedChange={(checked) => 
                  handleUpdateNotificationPref('push', 'enabled', checked)
                }
                data-testid="push-notifications-toggle"
              />
            </div>
            
            {trackingInfo.notificationPreferences.push.enabled && (
              <div className="ml-6">
                <p className="text-sm text-muted-foreground">
                  Browser push notifications for real-time tracking updates
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
