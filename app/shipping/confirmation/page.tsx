'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Calendar, 
  Clock, 
  Truck, 
  CreditCard, 
  Copy,
  ExternalLink,
  Phone,
  Mail,
  Download,
  Home,
  QrCode,
  MapPin,
  User,
  CheckCircle2,
  Building,
  FileText,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  SubmissionResponse, 
  ShippingTransaction, 
  ConfirmationPageData,
  CarrierAssignment,
  PickupConfirmationDetails,
  DeliveryEstimateDetails,
  ShipmentReferences 
} from '@/lib/types';

interface ConfirmationSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
}

function ConfirmationSection({ 
  title, 
  children, 
  icon, 
  defaultExpanded = false 
}: ConfirmationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="mb-6">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  );
}

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      console.log('ConfirmationPage - Text copied to clipboard:', text);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('ConfirmationPage - Failed to copy text:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2"
      disabled={copied}
    >
      {copied ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? 'Copied!' : label}
    </Button>
  );
}

function generateConfirmationNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SHP-${year}-${randomSuffix}`;
}

function generateQRCodeUrl(confirmationNumber: string): string {
  // In a real implementation, this would generate an actual QR code
  // For now, return a placeholder QR code service URL
  const trackingUrl = `https://tracking.example.com/${confirmationNumber}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`;
}

function formatBusinessDay(date: Date): string {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `in ${diffDays} days`;
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function calculateBusinessDaysFromNow(businessDays: number): Date {
  const date = new Date();
  let addedDays = 0;
  
  while (addedDays < businessDays) {
    date.setDate(date.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return date;
}

function createConfirmationData(
  confirmationResponse: SubmissionResponse,
  transaction: ShippingTransaction
): ConfirmationPageData {
  const bookingTimestamp = new Date();
  const pickupDate = transaction.pickupDetails?.date ? 
    new Date(transaction.pickupDetails.date) : 
    calculateBusinessDaysFromNow(1);
  
  const estimatedDeliveryDate = transaction.selectedOption ? 
    calculateBusinessDaysFromNow(transaction.selectedOption.transitDays + 1) :
    calculateBusinessDaysFromNow(3);

  const carrierInfo: CarrierAssignment = {
    carrierId: transaction.selectedOption?.carrier || 'EXPRESS-001',
    carrierName: confirmationResponse.carrierInfo.name,
    carrierLogo: confirmationResponse.carrierInfo.logo || '/api/placeholder/120/40',
    serviceLevel: transaction.selectedOption?.serviceType || 'Ground Service',
    trackingUrlTemplate: confirmationResponse.carrierInfo.trackingUrl || 'https://tracking.example.com/{trackingNumber}'
  };

  const pickupConfirmation: PickupConfirmationDetails = {
    confirmedDate: pickupDate,
    timeWindow: {
      startTime: transaction.pickupDetails?.timeSlot.startTime || '08:00',
      endTime: transaction.pickupDetails?.timeSlot.endTime || '12:00',
      timezone: 'EST'
    },
    status: 'confirmed',
    instructionsSent: {
      sent: true,
      timestamp: bookingTimestamp,
      method: 'system',
      recipient: 'carrier-dispatch'
    },
    contactNotified: {
      sent: true,
      timestamp: bookingTimestamp,
      method: 'email',
      recipient: transaction.shipmentDetails.origin.contactInfo.email
    },
    calendarInvite: {
      sent: true,
      timestamp: bookingTimestamp,
      method: 'email',
      recipient: transaction.shipmentDetails.origin.contactInfo.email
    }
  };

  const deliveryEstimate: DeliveryEstimateDetails = {
    estimatedDate: estimatedDeliveryDate,
    timeCommitment: 'By 5:00 PM EST',
    deliveryStatus: 'on-schedule',
    deliveryAddress: transaction.shipmentDetails.destination,
    contactPerson: transaction.shipmentDetails.destination.contactInfo,
    specialInstructions: transaction.shipmentDetails.package.specialHandling || []
  };

  const references: ShipmentReferences = {
    customerReference: transaction.paymentInfo?.reference,
    internalReference: `INT-${Date.now()}`,
    carrierReference: `CAR-${Date.now()}`,
    poNumber: transaction.paymentInfo?.paymentDetails?.purchaseOrder?.poNumber,
    bolNumber: transaction.paymentInfo?.paymentDetails?.billOfLading?.bolNumber
  };

  return {
    confirmationNumber: confirmationResponse.confirmationNumber,
    bookingTimestamp,
    transaction,
    carrierInfo,
    pickupConfirmation,
    deliveryEstimate,
    references
  };
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [confirmationData, setConfirmationData] = useState<ConfirmationPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('ConfirmationPage - Component mounting');

  useEffect(() => {
    console.log('ConfirmationPage - useEffect triggered');
    
    try {
      // Get confirmation data from localStorage
      const confirmationResponse = localStorage.getItem('shipping-confirmation');
      const transactionData = localStorage.getItem('currentShippingTransaction');
      
      console.log('ConfirmationPage - localStorage data check:', {
        hasConfirmation: !!confirmationResponse,
        hasTransaction: !!transactionData,
        confirmationLength: confirmationResponse?.length,
        transactionLength: transactionData?.length
      });
      
      if (confirmationResponse && transactionData) {
        const parsedConfirmation: SubmissionResponse = JSON.parse(confirmationResponse);
        const parsedTransaction: ShippingTransaction = JSON.parse(transactionData);
        
        console.log('ConfirmationPage - Confirmation response:', parsedConfirmation);
        console.log('ConfirmationPage - Transaction data:', parsedTransaction);
        
        const fullConfirmationData = createConfirmationData(parsedConfirmation, parsedTransaction);
        setConfirmationData(fullConfirmationData);
        
        console.log('ConfirmationPage - Full confirmation data created:', fullConfirmationData);
      } else {
        console.log('ConfirmationPage - Missing data - creating mock data for testing');
        
        // Create mock data if none exists (for testing/demo purposes)
        const mockConfirmationResponse: SubmissionResponse = {
          confirmationNumber: 'SHP-2025-DEMO123',
          estimatedDelivery: 'Thursday, July 24, 2025',
          trackingNumber: 'TRK-2025-DEMO789',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          carrierInfo: {
            name: 'Express Logistics',
            logo: '/api/placeholder/120/40',
            trackingUrl: 'https://tracking.example.com/TRK-2025-DEMO789'
          },
          totalCost: 89.50
        };

        const mockTransaction: ShippingTransaction = {
          id: 'demo-transaction-001',
          timestamp: new Date(),
          status: 'confirmed',
          shipmentDetails: {
            origin: {
              address: '123 Business St',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'US',
              isResidential: false,
              locationType: 'commercial',
              contactInfo: {
                name: 'John Smith',
                company: 'Acme Manufacturing',
                phone: '312-555-0123',
                email: 'john.smith@acme.com'
              }
            },
            destination: {
              address: '456 Commerce Ave',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'US',
              isResidential: false,
              locationType: 'commercial',
              contactInfo: {
                name: 'Jane Doe',
                company: 'Global Retailers',
                phone: '212-555-0456',
                email: 'jane.doe@globalretailers.com'
              }
            },
            package: {
              type: 'medium',
              dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
              weight: { value: 5, unit: 'lbs' },
              declaredValue: 250.00,
              currency: 'USD',
              contents: 'Electronic components',
              contentsCategory: 'electronics',
              specialHandling: ['fragile'],
              multiplePackages: undefined
            },
            deliveryPreferences: {
              signatureRequired: true,
              adultSignatureRequired: false,
              smsConfirmation: true,
              photoProof: false,
              saturdayDelivery: false,
              holdAtLocation: false,
              serviceLevel: 'reliable'
            }
          },
          selectedOption: {
            id: 'ground-express',
            category: 'ground',
            serviceType: 'Ground Express',
            carrier: 'Express Logistics',
            transitDays: 2,
            pricing: {
              baseRate: 45.00,
              fuelSurcharge: 8.50,
              fuelSurchargePercentage: 18.9,
              insurance: 5.00,
              insurancePercentage: 2.0,
              specialHandling: 15.00,
              deliveryConfirmation: 3.50,
              taxes: 12.50,
              taxPercentage: 8.5,
              total: 89.50,
              calculationBasis: {
                distance: 800,
                weight: 5,
                zone: 'Zone-3'
              }
            },
            estimatedDelivery: 'Thursday, July 24, 2025',
            features: ['Tracking', 'Insurance', 'Signature Required'],
            carbonFootprint: 2.8
          },
          paymentInfo: {
            method: 'po',
            reference: 'PO-2025-001',
            paymentDetails: {
              purchaseOrder: {
                poNumber: 'PO-2025-001',
                poAmount: 89.50,
                expirationDate: '2025-08-31',
                approvalContact: 'John Smith',
                department: 'Purchasing'
              }
            }
          },
          pickupDetails: {
            date: '2025-07-22',
            timeSlot: {
              id: 'morning',
              display: '8:00 AM - 12:00 PM',
              startTime: '08:00',
              endTime: '12:00',
              availability: 'available'
            },
            instructions: 'Package ready at loading dock',
            primaryContact: {
              name: 'John Smith',
              mobilePhone: '312-555-0123',
              email: 'john.smith@acme.com',
              preferredContactMethod: 'phone',
              authorizationLevel: 'full'
            },
            accessInstructions: {
              securityRequired: false,
              appointmentRequired: false,
              limitedParking: false,
              forkliftAvailable: true,
              liftgateRequired: false,
              parkingInstructions: 'Use loading dock entrance',
              packageLocation: 'Loading dock B',
              driverInstructions: 'Call upon arrival'
            },
            equipmentRequirements: {
              dolly: false,
              applianceDolly: false,
              furniturePads: false,
              straps: false,
              palletJack: false,
              twoPersonTeam: false,
              loadingAssistance: 'customer'
            },
            notificationPreferences: {
              emailReminder24h: true,
              smsReminder2h: true,
              callReminder30m: true,
              driverEnRoute: true,
              pickupCompletion: true,
              transitUpdates: true,
              pickupReminders: [],
              realTimeUpdates: [],
              communicationChannels: [],
              escalationProcedures: [],
              businessHoursOnly: false
            },
            readyTime: '07:30',
            authorizedPersonnel: ['John Smith', 'Mary Johnson']
          }
        };

        const demoConfirmationData = createConfirmationData(mockConfirmationResponse, mockTransaction);
        setConfirmationData(demoConfirmationData);
        console.log('ConfirmationPage - Demo confirmation data created:', demoConfirmationData);
      }
    } catch (error) {
      console.error('ConfirmationPage - Failed to parse confirmation data:', error);
      setError('Failed to load confirmation data. Please try again.');
    }
    
    setIsLoading(false);
  }, []);

  const handleStartNewShipment = () => {
    console.log('ConfirmationPage - Starting new shipment');
    localStorage.removeItem('currentShippingTransaction');
    localStorage.removeItem('shipping-confirmation');
    router.push('/shipping');
  };

  const handleTrackShipment = () => {
    if (confirmationData?.carrierInfo?.trackingUrlTemplate) {
      const trackingUrl = confirmationData.carrierInfo.trackingUrlTemplate.replace(
        '{trackingNumber}', 
        confirmationData.confirmationNumber
      );
      console.log('ConfirmationPage - Opening tracking URL:', trackingUrl);
      window.open(trackingUrl, '_blank');
    }
  };

  const handlePrintConfirmation = () => {
    console.log('ConfirmationPage - Printing confirmation');
    window.print();
  };

  if (isLoading) {
    console.log('ConfirmationPage - Showing loading state');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !confirmationData) {
    console.log('ConfirmationPage - Showing error state:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Confirmation Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'No shipment confirmation data found. Please create a new shipment.'}
            </p>
          </div>
          <Button onClick={() => router.push('/shipping')}>
            Create New Shipment
          </Button>
        </div>
      </div>
    );
  }

  console.log('ConfirmationPage - Rendering confirmation with data:', confirmationData);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Shipment Successfully Booked!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your shipment has been confirmed and is ready for pickup
          </p>
          <p className="text-sm text-muted-foreground">
            Booking completed on {confirmationData.bookingTimestamp.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </p>
        </div>

        {/* Confirmation Number Card */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-green-800">Confirmation Number</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-green-900 font-mono block mb-3">
                  {confirmationData.confirmationNumber}
                </span>
                <CopyButton text={confirmationData.confirmationNumber} label="Copy Number" />
              </div>
              
              <div className="text-center">
                <img 
                  src={generateQRCodeUrl(confirmationData.confirmationNumber)}
                  alt="QR Code for tracking"
                  className="w-24 h-24 mx-auto mb-3 border rounded"
                />
                <p className="text-xs text-green-700">
                  Scan for mobile tracking
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-2">
                ✓ Keep this confirmation number for your records
              </p>
              <p className="text-xs text-green-600">
                Reference this number for any inquiries about your shipment
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipment Summary */}
        <Card className="mb-8 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="h-6 w-6 text-blue-600" />
              Shipment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">ROUTE</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {confirmationData.transaction.shipmentDetails.origin.city}, {confirmationData.transaction.shipmentDetails.origin.state}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">
                      {confirmationData.transaction.shipmentDetails.destination.city}, {confirmationData.transaction.shipmentDetails.destination.state}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">CARRIER & SERVICE</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <img 
                      src={confirmationData.carrierInfo.carrierLogo} 
                      alt={confirmationData.carrierInfo.carrierName}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-medium">{confirmationData.carrierInfo.carrierName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {confirmationData.carrierInfo.serviceLevel}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">PACKAGE DETAILS</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {confirmationData.transaction.shipmentDetails.package.type}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Weight:</span> {confirmationData.transaction.shipmentDetails.package.weight.value} {confirmationData.transaction.shipmentDetails.package.weight.unit}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Value:</span> ${confirmationData.transaction.shipmentDetails.package.declaredValue.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">PICKUP DATE</h4>
                  <p className="font-medium text-lg">
                    {formatBusinessDay(confirmationData.pickupConfirmation.confirmedDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {confirmationData.pickupConfirmation.timeWindow.startTime} - {confirmationData.pickupConfirmation.timeWindow.endTime} {confirmationData.pickupConfirmation.timeWindow.timezone}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">ESTIMATED DELIVERY</h4>
                  <p className="font-medium text-lg text-green-700">
                    {formatBusinessDay(confirmationData.deliveryEstimate.estimatedDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {confirmationData.deliveryEstimate.timeCommitment}
                  </p>
                  <Badge 
                    variant="outline" 
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {confirmationData.deliveryEstimate.deliveryStatus.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">TOTAL COST</h4>
                  <p className="text-3xl font-bold text-primary">
                    ${confirmationData.transaction.selectedOption?.pricing.total.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {confirmationData.transaction.paymentInfo?.method.toUpperCase()} Payment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pickup Confirmation Details */}
        <ConfirmationSection 
          title="Pickup Confirmation Details" 
          icon={<Calendar className="h-5 w-5 text-blue-600" />}
          defaultExpanded={true}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Pickup Schedule</h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Confirmed</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {confirmationData.pickupConfirmation.confirmedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Time Window: {confirmationData.pickupConfirmation.timeWindow.startTime} - {confirmationData.pickupConfirmation.timeWindow.endTime} {confirmationData.pickupConfirmation.timeWindow.timezone}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Pickup Address</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {confirmationData.transaction.shipmentDetails.origin.contactInfo.company || confirmationData.transaction.shipmentDetails.origin.contactInfo.name}
                  </p>
                  <p>{confirmationData.transaction.shipmentDetails.origin.address}</p>
                  {confirmationData.transaction.shipmentDetails.origin.suite && (
                    <p>Suite: {confirmationData.transaction.shipmentDetails.origin.suite}</p>
                  )}
                  <p>
                    {confirmationData.transaction.shipmentDetails.origin.city}, {confirmationData.transaction.shipmentDetails.origin.state} {confirmationData.transaction.shipmentDetails.origin.zip}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Pickup Instructions Sent</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Driver instructions transmitted to carrier</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Pickup contact notified via email</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Calendar invitation sent</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">What to Expect</h4>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <ul className="text-sm space-y-1">
                    <li>• Driver will call 30 minutes before arrival</li>
                    <li>• Package must be ready and accessible</li>
                    <li>• Authorized person must be available</li>
                    <li>• Have confirmation number ready</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ConfirmationSection>

        {/* Delivery Information Details */}
        <ConfirmationSection 
          title="Delivery Information" 
          icon={<Truck className="h-5 w-5 text-green-600" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {confirmationData.deliveryEstimate.contactPerson.company || confirmationData.deliveryEstimate.contactPerson.name}
                  </p>
                  <p>{confirmationData.deliveryEstimate.deliveryAddress.address}</p>
                  {confirmationData.deliveryEstimate.deliveryAddress.suite && (
                    <p>Suite: {confirmationData.deliveryEstimate.deliveryAddress.suite}</p>
                  )}
                  <p>
                    {confirmationData.deliveryEstimate.deliveryAddress.city}, {confirmationData.deliveryEstimate.deliveryAddress.state} {confirmationData.deliveryEstimate.deliveryAddress.zip}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Delivery Contact</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{confirmationData.deliveryEstimate.contactPerson.name}</p>
                  <p>{confirmationData.deliveryEstimate.contactPerson.phone}</p>
                  <p>{confirmationData.deliveryEstimate.contactPerson.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Commitment</h4>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span className="font-medium">
                      {confirmationData.deliveryEstimate.estimatedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {confirmationData.deliveryEstimate.timeCommitment}
                  </p>
                </div>
              </div>

              {confirmationData.deliveryEstimate.specialInstructions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Special Instructions</h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <ul className="text-sm space-y-1">
                      {confirmationData.deliveryEstimate.specialInstructions.map((instruction, index) => (
                        <li key={index}>• {instruction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ConfirmationSection>

        {/* Shipment Reference Information */}
        <ConfirmationSection 
          title="Shipment Reference Information" 
          icon={<FileText className="h-5 w-5 text-purple-600" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">INTERNAL REFERENCES</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confirmation Number:</span>
                    <span className="font-mono text-sm">{confirmationData.confirmationNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Internal Reference:</span>
                    <span className="font-mono text-sm">{confirmationData.references.internalReference}</span>
                  </div>
                  {confirmationData.references.carrierReference && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carrier Reference:</span>
                      <span className="font-mono text-sm">{confirmationData.references.carrierReference}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">PAYMENT REFERENCES</h4>
                <div className="space-y-2">
                  {confirmationData.references.poNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PO Number:</span>
                      <span className="font-mono text-sm">{confirmationData.references.poNumber}</span>
                    </div>
                  )}
                  {confirmationData.references.bolNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">BOL Number:</span>
                      <span className="font-mono text-sm">{confirmationData.references.bolNumber}</span>
                    </div>
                  )}
                  {confirmationData.references.customerReference && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Reference:</span>
                      <span className="font-mono text-sm">{confirmationData.references.customerReference}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ConfirmationSection>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Customer Support & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">24/7 Customer Support</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">1-800-SHIP-NOW (7447)</p>
                      <p className="text-sm text-muted-foreground">Available 24/7 for shipment assistance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">support@shippingsystem.com</p>
                      <p className="text-sm text-muted-foreground">Email support with 4-hour response time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Live Chat Available</p>
                      <p className="text-sm text-muted-foreground">Monday-Friday 6 AM - 10 PM EST</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Important Reminders</h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Keep your confirmation number for all inquiries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Ensure authorized personnel are available for pickup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Package must be ready at scheduled time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Changes must be made at least 2 hours in advance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <Button
            variant="outline"
            onClick={handlePrintConfirmation}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Print Confirmation
          </Button>
          
          <Button
            variant="outline"
            onClick={handleTrackShipment}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Track This Shipment
          </Button>
          
          <Button
            onClick={handleStartNewShipment}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Ship Another Package
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>

        {/* Print-specific footer */}
        <div className="hidden print:block mt-8 text-center text-sm text-muted-foreground">
          <Separator className="mb-4" />
          <p>
            This is an official shipping confirmation. Keep this document for your records.
          </p>
          <p>
            For support: 1-800-SHIP-NOW | support@shippingsystem.com
          </p>
        </div>
      </div>
    </div>
  );
}
