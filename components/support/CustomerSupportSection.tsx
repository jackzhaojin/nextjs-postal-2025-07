'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Clock,
  User,
  Shield,
  CreditCard,
  Settings,
  FileQuestion,
  Users,
  Globe,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  CustomerSupportInfo,
  SupportChannel,
  AccountManagerInfo,
  SpecializedSupportChannel,
  SelfServiceResources,
  AvailabilitySchedule,
  ShippingTransaction
} from '@/lib/types';

interface CustomerSupportSectionProps {
  transaction: ShippingTransaction;
}

export function CustomerSupportSection({ transaction }: CustomerSupportSectionProps) {
  const [supportInfo, setSupportInfo] = useState<CustomerSupportInfo | null>(null);
  const [chatAvailable, setChatAvailable] = useState(false);

  useEffect(() => {
    console.log('CustomerSupportSection - Initializing support info for transaction:', transaction.id);
    generateMockSupportInfo();
    checkChatAvailability();
  }, [transaction.id]);

  const generateMockSupportInfo = () => {
    console.log('CustomerSupportSection - Generating mock support information');

    // Determine if customer is enterprise level (high-value or frequent shipper)
    const isEnterpriseCustomer = transaction.shipmentDetails.package.declaredValue > 10000;

    const mockSupportInfo: CustomerSupportInfo = {
      primarySupport: {
        type: 'phone',
        contact: '1-800-SHIP-NOW',
        availability: {
          timezone: 'US/Eastern',
          hours: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '20:00' }, // Monday
            { dayOfWeek: 2, startTime: '08:00', endTime: '20:00' }, // Tuesday
            { dayOfWeek: 3, startTime: '08:00', endTime: '20:00' }, // Wednesday
            { dayOfWeek: 4, startTime: '08:00', endTime: '20:00' }, // Thursday
            { dayOfWeek: 5, startTime: '08:00', endTime: '20:00' }, // Friday
            { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' }, // Saturday
            { dayOfWeek: 0, startTime: '10:00', endTime: '16:00' }  // Sunday
          ],
          holidays: [],
          emergencyContact: '1-800-EMERGENCY'
        },
        responseTime: {
          initial: '< 5 minutes',
          resolution: '1-2 business days',
          sla: '99.5% availability, 24/7 emergency support'
        },
        escalationPath: {
          level1: 'Customer Service Representative',
          level2: 'Senior Support Specialist',
          level3: 'Support Manager',
          automaticEscalation: true,
          escalationTriggers: ['unresolved-24h', 'high-value-shipment', 'customer-request']
        }
      },
      accountManager: isEnterpriseCustomer ? {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@shippingsystem.com',
        phone: '1-800-SHIP-NOW',
        extension: '2154',
        availability: {
          timezone: 'US/Eastern',
          hours: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '17:00' }
          ],
          holidays: []
        },
        territory: 'Enterprise Accounts - Northeast'
      } : null,
      specializedSupport: [
        {
          type: 'claims',
          name: 'Claims Department',
          contact: '1-800-CLAIMS-1',
          description: 'Lost, damaged, or delayed shipment claims',
          availability: {
            timezone: 'US/Eastern',
            hours: [
              { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
              { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
              { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
              { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
              { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' }
            ],
            holidays: []
          }
        },
        {
          type: 'compliance',
          name: 'Regulatory Compliance',
          contact: '1-800-COMPLY',
          description: 'Hazmat, international shipping, and regulatory compliance',
          availability: {
            timezone: 'US/Eastern',
            hours: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
            ],
            holidays: []
          }
        },
        {
          type: 'billing',
          name: 'Billing Support',
          contact: '1-800-BILLING',
          description: 'Invoices, payments, and account billing questions',
          availability: {
            timezone: 'US/Eastern',
            hours: [
              { dayOfWeek: 1, startTime: '08:00', endTime: '19:00' },
              { dayOfWeek: 2, startTime: '08:00', endTime: '19:00' },
              { dayOfWeek: 3, startTime: '08:00', endTime: '19:00' },
              { dayOfWeek: 4, startTime: '08:00', endTime: '19:00' },
              { dayOfWeek: 5, startTime: '08:00', endTime: '19:00' }
            ],
            holidays: []
          }
        },
        {
          type: 'technical',
          name: 'Technical Support',
          contact: 'tech@shippingsystem.com',
          description: 'Website, app, and integration technical issues',
          availability: {
            timezone: 'US/Eastern',
            hours: [
              { dayOfWeek: 1, startTime: '07:00', endTime: '21:00' },
              { dayOfWeek: 2, startTime: '07:00', endTime: '21:00' },
              { dayOfWeek: 3, startTime: '07:00', endTime: '21:00' },
              { dayOfWeek: 4, startTime: '07:00', endTime: '21:00' },
              { dayOfWeek: 5, startTime: '07:00', endTime: '21:00' },
              { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 0, startTime: '10:00', endTime: '16:00' }
            ],
            holidays: []
          }
        }
      ],
      selfServiceResources: {
        knowledgeBaseUrl: '/knowledge-base',
        faqUrl: '/faq',
        trackingPortalUrl: '/tracking',
        communityForumUrl: '/community'
      }
    };

    setSupportInfo(mockSupportInfo);
    console.log('CustomerSupportSection - Mock support info generated:', mockSupportInfo);
  };

  const checkChatAvailability = () => {
    // Simulate checking chat availability
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 8 && currentHour <= 20;
    setChatAvailable(isBusinessHours);
    console.log('CustomerSupportSection - Chat availability:', isBusinessHours);
  };

  const formatBusinessHours = (hours: readonly any[]) => {
    if (!hours || hours.length === 0) return 'Not specified';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped = hours.reduce((acc, hour) => {
      const timeRange = `${hour.startTime}-${hour.endTime}`;
      if (!acc[timeRange]) acc[timeRange] = [];
      acc[timeRange].push(dayNames[hour.dayOfWeek]);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([timeRange, days]: [string, any]) => `${days.join(', ')}: ${timeRange}`)
      .join('\n');
  };

  const isCurrentlyAvailable = (availability: AvailabilitySchedule): boolean => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = availability.hours.find(h => h.dayOfWeek === currentDay);
    if (!todayHours) return false;
    
    return currentTime >= todayHours.startTime && currentTime <= todayHours.endTime;
  };

  const getSupportChannelIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'chat':
        return <MessageCircle className="h-4 w-4" />;
      case 'portal':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSpecializedSupportIcon = (type: string) => {
    switch (type) {
      case 'claims':
        return <Shield className="h-4 w-4" />;
      case 'compliance':
        return <Globe className="h-4 w-4" />;
      case 'billing':
        return <CreditCard className="h-4 w-4" />;
      case 'technical':
        return <Settings className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (!supportInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Customer Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-pulse text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading support information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="customer-support-section">
      {/* Primary Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Primary Customer Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {getSupportChannelIcon(supportInfo.primarySupport.type)}
                <div>
                  <p className="font-semibold text-lg">{supportInfo.primarySupport.contact}</p>
                  <div className="flex items-center gap-2">
                    {isCurrentlyAvailable(supportInfo.primarySupport.availability) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <Badge variant="default" className="bg-green-100 text-green-800">Available Now</Badge>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <Badge variant="secondary">Outside Business Hours</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Response Time:</strong> {supportInfo.primarySupport.responseTime.initial}</p>
                <p><strong>Resolution Time:</strong> {supportInfo.primarySupport.responseTime.resolution}</p>
                <p><strong>SLA:</strong> {supportInfo.primarySupport.responseTime.sla}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              {chatAvailable && (
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Business Hours ({supportInfo.primarySupport.availability.timezone})</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-line">
                {formatBusinessHours(supportInfo.primarySupport.availability.hours)}
              </pre>
            </div>
            
            <div>
              <p className="font-medium mb-2">Emergency Contact</p>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{supportInfo.primarySupport.availability.emergencyContact}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available 24/7 for urgent shipment issues
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Manager */}
      {supportInfo.accountManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Account Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-lg">{supportInfo.accountManager.name}</p>
                  <p className="text-sm text-muted-foreground">{supportInfo.accountManager.territory}</p>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{supportInfo.accountManager.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{supportInfo.accountManager.phone}</span>
                    {supportInfo.accountManager.extension && (
                      <span className="text-muted-foreground">ext. {supportInfo.accountManager.extension}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-medium mb-2">Availability ({supportInfo.accountManager.availability.timezone})</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-line">
                {formatBusinessHours(supportInfo.accountManager.availability.hours)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialized Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Specialized Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {supportInfo.specializedSupport.map((support) => (
              <div key={support.type} className="p-3 border rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  {getSpecializedSupportIcon(support.type)}
                  <div>
                    <p className="font-medium">{support.name}</p>
                    <p className="text-xs text-muted-foreground">{support.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{support.contact}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {isCurrentlyAvailable(support.availability) ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 text-yellow-500" />
                          <span>Closed</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Self-Service Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Self-Service Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Knowledge Base & Help</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(supportInfo.selfServiceResources.knowledgeBaseUrl, '_blank')}
                >
                  <FileQuestion className="h-4 w-4 mr-2" />
                  Knowledge Base
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(supportInfo.selfServiceResources.faqUrl, '_blank')}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Frequently Asked Questions
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Tools & Community</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(supportInfo.selfServiceResources.trackingPortalUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Tracking Portal
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                
                {supportInfo.selfServiceResources.communityForumUrl && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(supportInfo.selfServiceResources.communityForumUrl!, '_blank')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Community Forum
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Support Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>For faster service:</strong></p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Have your confirmation number ready: <code className="bg-gray-100 px-1 rounded">{transaction.confirmationNumber}</code></li>
                  <li>Use the appropriate specialized support channel for your issue type</li>
                  <li>Check our Knowledge Base for common questions before calling</li>
                  <li>For emergency issues, use our 24/7 emergency line</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
