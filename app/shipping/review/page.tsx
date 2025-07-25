'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShippingForm } from '@/hooks/useShippingForm';
import { 
  ShippingTransaction, 
  PricingBreakdown as PricingBreakdownType, 
  TermsAcknowledgment,
  SubmissionValidationResult,
  FinalSubmissionRequest,
  SubmissionResponse
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  Edit, 
  MapPin, 
  Package, 
  CreditCard, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Printer, 
  RefreshCw,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { TermsAndConditions } from '@/components/forms/TermsAndConditions';
import { ValidationErrors } from '@/components/forms/ValidationErrors';
import { SubmissionValidator } from '@/lib/validation/submissionValidation';

interface ReviewSectionProps {
  title: string;
  editPath: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, editPath, isOpen, onToggle, children }: ReviewSectionProps) {
  const router = useRouter();

  console.log(`ReviewSection - ${title}: isOpen=${isOpen}`);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log(`Navigating to edit path: ${editPath}`);
                router.push(editPath);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="gap-2"
          >
            {isOpen ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface ShipmentSummaryProps {
  transaction: ShippingTransaction;
}

function ShipmentSummary({ transaction }: ShipmentSummaryProps) {
  console.log('ShipmentSummary - rendering with transaction:', transaction);

  const { shipmentDetails, selectedOption, pickupDetails } = transaction;
  const origin = shipmentDetails?.origin;
  const destination = shipmentDetails?.destination;
  const packageInfo = shipmentDetails?.package;

  // Calculate route display
  const routeDisplay = origin && destination 
    ? `${origin.city}, ${origin.state} → ${destination.city}, ${destination.state}`
    : 'Route not specified';

  // Format service type
  const serviceDisplay = selectedOption 
    ? `${selectedOption.serviceType} - ${selectedOption.transitDays} business days`
    : 'Service not selected';

  // Calculate package summary
  const packageSummary = packageInfo 
    ? `1 Package, ${packageInfo.weight.value} ${packageInfo.weight.unit}, ${packageInfo.dimensions.length}"×${packageInfo.dimensions.width}"×${packageInfo.dimensions.height}"`
    : 'Package details not specified';

  // Format pickup date
  const pickupDisplay = pickupDetails?.date 
    ? new Date(pickupDetails.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Pickup not scheduled';

  // Format delivery estimate
  const deliveryDisplay = selectedOption?.estimatedDelivery || 'Delivery estimate pending';

  console.log('ShipmentSummary - calculated values:', {
    routeDisplay,
    serviceDisplay,
    packageSummary,
    pickupDisplay,
    deliveryDisplay
  });

  return (
    <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="h-6 w-6" />
          Shipment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">ROUTE</h3>
              <p className="text-lg font-medium">{routeDisplay}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">SERVICE</h3>
              <p className="text-lg font-medium">{serviceDisplay}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">PACKAGE</h3>
              <p className="text-lg font-medium">{packageSummary}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">TOTAL COST</h3>
              <p className="text-2xl font-bold text-primary">
                {selectedOption?.pricing?.total 
                  ? `$${selectedOption.pricing.total.toFixed(2)}`
                  : 'Price pending'
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">PICKUP</h3>
              <p className="text-lg font-medium">{pickupDisplay}</p>
              {pickupDetails?.timeSlot && (
                <p className="text-sm text-muted-foreground">{pickupDetails.timeSlot.display}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">ESTIMATED DELIVERY</h3>
              <p className="text-lg font-medium">{deliveryDisplay}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OriginDetailsProps {
  origin: ShippingTransaction['shipmentDetails']['origin'];
}

function OriginDetails({ origin }: OriginDetailsProps) {
  console.log('OriginDetails - rendering with origin:', origin);

  if (!origin) {
    return <p className="text-muted-foreground">Origin details not provided</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pickup Address
        </h4>
        <div className="space-y-1">
          <p>{origin.address}</p>
          {origin.suite && <p>Suite: {origin.suite}</p>}
          <p>{origin.city}, {origin.state} {origin.zip}</p>
          <p>{origin.country}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2">Location Type</h4>
        <Badge variant="secondary" className="capitalize">
          {origin.locationType?.replace(/[-_]/g, ' ')}
        </Badge>
        {origin.locationDescription && (
          <p className="text-sm text-muted-foreground mt-1">{origin.locationDescription}</p>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2">Contact Information</h4>
        <div className="space-y-1">
          <p><strong>Name:</strong> {origin.contactInfo?.name || 'Not provided'}</p>
          {origin.contactInfo?.company && <p><strong>Company:</strong> {origin.contactInfo.company}</p>}
          <p><strong>Phone:</strong> {origin.contactInfo?.phone || 'Not provided'}</p>
          <p><strong>Email:</strong> {origin.contactInfo?.email || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}

interface DestinationDetailsProps {
  destination: ShippingTransaction['shipmentDetails']['destination'];
}

function DestinationDetails({ destination }: DestinationDetailsProps) {
  console.log('DestinationDetails - rendering with destination:', destination);

  if (!destination) {
    return <p className="text-muted-foreground">Destination details not provided</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </h4>
        <div className="space-y-1">
          <p>{destination.address}</p>
          {destination.suite && <p>Suite: {destination.suite}</p>}
          <p>{destination.city}, {destination.state} {destination.zip}</p>
          <p>{destination.country}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2">Location Type</h4>
        <Badge variant="secondary" className="capitalize">
          {destination.locationType?.replace(/[-_]/g, ' ')}
        </Badge>
        {destination.locationDescription && (
          <p className="text-sm text-muted-foreground mt-1">{destination.locationDescription}</p>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2">Contact Information</h4>
        <div className="space-y-1">
          <p><strong>Name:</strong> {destination.contactInfo?.name || 'Not provided'}</p>
          {destination.contactInfo?.company && <p><strong>Company:</strong> {destination.contactInfo.company}</p>}
          <p><strong>Phone:</strong> {destination.contactInfo?.phone || 'Not provided'}</p>
          <p><strong>Email:</strong> {destination.contactInfo?.email || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}

interface PackageDetailsProps {
  packageInfo: ShippingTransaction['shipmentDetails']['package'];
  deliveryPreferences: ShippingTransaction['shipmentDetails']['deliveryPreferences'];
}

function PackageDetails({ packageInfo, deliveryPreferences }: PackageDetailsProps) {
  console.log('PackageDetails - rendering with packageInfo:', packageInfo, 'deliveryPreferences:', deliveryPreferences);

  if (!packageInfo) {
    return <p className="text-muted-foreground">Package details not provided</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Package Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p><strong>Type:</strong> <span className="capitalize">{packageInfo.type}</span></p>
            <p><strong>Dimensions:</strong> {packageInfo.dimensions.length}" × {packageInfo.dimensions.width}" × {packageInfo.dimensions.height}"</p>
            <p><strong>Weight:</strong> {packageInfo.weight.value} {packageInfo.weight.unit}</p>
          </div>
          <div>
            <p><strong>Declared Value:</strong> ${packageInfo.declaredValue?.toFixed(2) || '0.00'}</p>
            <p><strong>Contents:</strong> {packageInfo.contents || 'Not specified'}</p>
            <p><strong>Category:</strong> <span className="capitalize">{packageInfo.contentsCategory?.replace(/[-_]/g, ' ')}</span></p>
          </div>
        </div>
      </div>

      {packageInfo.specialHandling && packageInfo.specialHandling.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Special Handling</h4>
            <div className="flex flex-wrap gap-2">
              {packageInfo.specialHandling.map((handling, index) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {handling.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {deliveryPreferences && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Delivery Preferences</h4>
            <div className="space-y-2">
              {deliveryPreferences.signatureRequired && <Badge variant="secondary">Signature Required</Badge>}
              {deliveryPreferences.adultSignatureRequired && <Badge variant="secondary">Adult Signature Required</Badge>}
              {deliveryPreferences.smsConfirmation && <Badge variant="secondary">SMS Confirmation</Badge>}
              {deliveryPreferences.photoProof && <Badge variant="secondary">Photo Proof</Badge>}
              {deliveryPreferences.saturdayDelivery && <Badge variant="secondary">Saturday Delivery</Badge>}
              {deliveryPreferences.holdAtLocation && <Badge variant="secondary">Hold at Location</Badge>}
              <div className="mt-2">
                <p><strong>Service Level:</strong> <span className="capitalize">{deliveryPreferences.serviceLevel?.replace(/[-_]/g, ' ')}</span></p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface PricingBreakdownProps {
  pricing: PricingBreakdownType | undefined;
}

function PricingBreakdown({ pricing }: PricingBreakdownProps) {
  console.log('PricingBreakdown - rendering with pricing:', pricing);

  if (!pricing) {
    return <p className="text-muted-foreground">Pricing breakdown not available</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Cost Breakdown
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Base Rate</span>
            <span>${pricing.baseRate?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Fuel Surcharge ({pricing.fuelSurchargePercentage || 0}%)</span>
            <span>${pricing.fuelSurcharge?.toFixed(2) || '0.00'}</span>
          </div>
          {pricing.insurance > 0 && (
            <div className="flex justify-between">
              <span>Insurance ({pricing.insurancePercentage || 0}%)</span>
              <span>${pricing.insurance?.toFixed(2) || '0.00'}</span>
            </div>
          )}
          {pricing.specialHandling > 0 && (
            <div className="flex justify-between">
              <span>Special Handling</span>
              <span>${pricing.specialHandling?.toFixed(2) || '0.00'}</span>
            </div>
          )}
          {pricing.deliveryConfirmation > 0 && (
            <div className="flex justify-between">
              <span>Delivery Confirmation</span>
              <span>${pricing.deliveryConfirmation?.toFixed(2) || '0.00'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Taxes ({pricing.taxPercentage || 0}%)</span>
            <span>${pricing.taxes?.toFixed(2) || '0.00'}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${pricing.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {pricing.calculationBasis && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Calculation Basis</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Distance:</strong> {pricing.calculationBasis.distance || 0} miles</p>
              <p><strong>Weight:</strong> {pricing.calculationBasis.weight || 0} lbs</p>
              {pricing.calculationBasis.dimensionalWeight && (
                <p><strong>Dimensional Weight:</strong> {pricing.calculationBasis.dimensionalWeight} lbs</p>
              )}
              {pricing.calculationBasis.zone && (
                <p><strong>Zone:</strong> {pricing.calculationBasis.zone}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface PaymentInformationProps {
  paymentInfo: ShippingTransaction['paymentInfo'];
}

function PaymentInformation({ paymentInfo }: PaymentInformationProps) {
  console.log('PaymentInformation - rendering with paymentInfo:', paymentInfo);

  if (!paymentInfo) {
    return <p className="text-muted-foreground">Payment information not provided</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Method
        </h4>
        <Badge variant="outline" className="capitalize">
          {paymentInfo.method?.replace(/[-_]/g, ' ')}
        </Badge>
        {paymentInfo.reference && (
          <p className="text-sm text-muted-foreground mt-1">Reference: {paymentInfo.reference}</p>
        )}
      </div>

      {paymentInfo.billingContact && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Billing Contact</h4>
            <div className="space-y-1">
              <p><strong>Name:</strong> {paymentInfo.billingContact.name}</p>
              {paymentInfo.billingContact.company && <p><strong>Company:</strong> {paymentInfo.billingContact.company}</p>}
              <p><strong>Phone:</strong> {paymentInfo.billingContact.phone}</p>
              <p><strong>Email:</strong> {paymentInfo.billingContact.email}</p>
            </div>
          </div>
        </>
      )}

      {paymentInfo.billingAddress && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Billing Address</h4>
            <div className="space-y-1">
              <p>{paymentInfo.billingAddress.address}</p>
              {paymentInfo.billingAddress.suite && <p>Suite: {paymentInfo.billingAddress.suite}</p>}
              <p>{paymentInfo.billingAddress.city}, {paymentInfo.billingAddress.state} {paymentInfo.billingAddress.zip}</p>
              <p>{paymentInfo.billingAddress.country}</p>
            </div>
          </div>
        </>
      )}

      {paymentInfo.companyInfo && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Company Information</h4>
            <div className="space-y-1">
              <p><strong>Legal Name:</strong> {paymentInfo.companyInfo.legalName}</p>
              {paymentInfo.companyInfo.dbaName && <p><strong>DBA Name:</strong> {paymentInfo.companyInfo.dbaName}</p>}
              <p><strong>Business Type:</strong> <span className="capitalize">{paymentInfo.companyInfo.businessType?.replace(/[-_]/g, ' ')}</span></p>
              <p><strong>Industry:</strong> {paymentInfo.companyInfo.industry}</p>
              <p><strong>Tax ID:</strong> {paymentInfo.companyInfo.taxId}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface PickupScheduleProps {
  pickupDetails: ShippingTransaction['pickupDetails'];
}

function PickupSchedule({ pickupDetails }: PickupScheduleProps) {
  console.log('PickupSchedule - rendering with pickupDetails:', pickupDetails);

  if (!pickupDetails) {
    return <p className="text-muted-foreground">Pickup schedule not provided</p>;
  }

  const pickupDate = pickupDetails.date ? new Date(pickupDetails.date) : null;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pickup Schedule
        </h4>
        <div className="space-y-2">
          {pickupDate && (
            <p><strong>Date:</strong> {pickupDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          )}
          {pickupDetails.timeSlot && (
            <p><strong>Time Window:</strong> {pickupDetails.timeSlot.display}</p>
          )}
          {pickupDetails.readyTime && (
            <p><strong>Package Ready Time:</strong> {pickupDetails.readyTime}</p>
          )}
        </div>
      </div>

      {pickupDetails.primaryContact && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Primary Contact</h4>
            <div className="space-y-1">
              <p><strong>Name:</strong> {pickupDetails.primaryContact.name}</p>
              <p><strong>Phone:</strong> {pickupDetails.primaryContact.mobilePhone}</p>
              <p><strong>Email:</strong> {pickupDetails.primaryContact.email}</p>
              {pickupDetails.primaryContact.jobTitle && (
                <p><strong>Title:</strong> {pickupDetails.primaryContact.jobTitle}</p>
              )}
            </div>
          </div>
        </>
      )}

      {pickupDetails.backupContact && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Backup Contact</h4>
            <div className="space-y-1">
              <p><strong>Name:</strong> {pickupDetails.backupContact.name}</p>
              <p><strong>Phone:</strong> {pickupDetails.backupContact.mobilePhone}</p>
              <p><strong>Email:</strong> {pickupDetails.backupContact.email}</p>
            </div>
          </div>
        </>
      )}

      {pickupDetails.instructions && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Special Instructions</h4>
            <p className="text-sm">{pickupDetails.instructions}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const { transaction, isLoading } = useShippingForm();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    origin: false,
    destination: false,
    package: false,
    pricing: false,
    payment: false,
    pickup: false
  });

  // Terms and submission state
  const [termsAcknowledgment, setTermsAcknowledgment] = useState<TermsAcknowledgment>({
    declaredValueAccuracy: false,
    insuranceRequirements: false,
    packageContentsCompliance: false,
    carrierAuthorization: false,
    hazmatCertification: false,
    internationalCompliance: false,
    customsDocumentation: false
  });

  const [validationResult, setValidationResult] = useState<SubmissionValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  console.log('ReviewPage - transaction:', transaction, 'isLoading:', isLoading);

  useEffect(() => {
    console.log('ReviewPage - useEffect triggered');
    if (!isLoading && (!transaction || !transaction.shipmentDetails)) {
      console.log('ReviewPage - No transaction data, redirecting to shipping');
      router.push('/shipping');
    }
  }, [transaction, isLoading, router]);

  // Validate submission when terms acknowledgment changes
  useEffect(() => {
    if (transaction && transaction.shipmentDetails && transaction.id) {
      console.log('ReviewPage - Running validation due to acknowledgment change');
      const result = SubmissionValidator.validateSubmission(transaction as ShippingTransaction, termsAcknowledgment);
      setValidationResult(result);
      console.log('ReviewPage - Validation result:', result);
    }
  }, [transaction, termsAcknowledgment]);

  const toggleSection = (section: string) => {
    console.log(`ReviewPage - toggling section: ${section}`);
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRetryValidation = () => {
    console.log('ReviewPage - Retrying validation');
    if (transaction && transaction.shipmentDetails && transaction.id) {
      const result = SubmissionValidator.validateSubmission(transaction as ShippingTransaction, termsAcknowledgment);
      setValidationResult(result);
    }
  };

  const handleSaveDraft = () => {
    console.log('ReviewPage - Saving draft');
    // TODO: Implement draft saving functionality
    // This would save the current state to localStorage or API
  };

  const handlePrintSummary = () => {
    console.log('ReviewPage - Printing summary');
    window.print();
  };

  const handleStartOver = () => {
    console.log('ReviewPage - Starting over');
    if (confirm('Are you sure you want to start over? All current shipment data will be lost.')) {
      // Clear localStorage and redirect to start
      localStorage.removeItem('shipping-transaction');
      router.push('/shipping');
    }
  };

  const handleSubmit = async () => {
    console.log('ReviewPage - handleSubmit called');
    
    if (!transaction || !transaction.id || !validationResult?.isValid) {
      console.log('ReviewPage - Cannot submit: invalid transaction or validation failed');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const submissionRequest: FinalSubmissionRequest = {
        transaction: transaction as ShippingTransaction,
        termsAcknowledgment,
        submissionTimestamp: new Date().toISOString(),
        clientId: 'web-client-' + Date.now(),
        userAgent: navigator.userAgent
      };

      console.log('ReviewPage - Submitting request:', submissionRequest);

      const response = await fetch('/api/shipments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const submissionResponse: SubmissionResponse = await response.json();
      console.log('ReviewPage - Submission successful:', submissionResponse);

      // Store confirmation data and redirect
      localStorage.setItem('shipping-confirmation', JSON.stringify(submissionResponse));
      router.push('/shipping/confirmation');

    } catch (error) {
      console.error('ReviewPage - Submission error:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log('ReviewPage - showing loading state');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction || !transaction.shipmentDetails) {
    console.log('ReviewPage - No transaction data available');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Shipment Data</h1>
          <p className="text-muted-foreground mb-6">
            No shipment information found. Please start a new shipment.
          </p>
          <Button onClick={() => router.push('/shipping')}>
            Start New Shipment
          </Button>
        </div>
      </div>
    );
  }

  // Cast to full ShippingTransaction for type safety in components
  const fullTransaction = transaction as ShippingTransaction;

  console.log('ReviewPage - rendering with fullTransaction:', fullTransaction);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review Your Shipment</h1>
          <p className="text-muted-foreground">
            Please review all details carefully before submitting your shipment request.
          </p>
        </div>

        <ShipmentSummary transaction={fullTransaction} />

        <div className="space-y-6">
          <ReviewSection
            title="Origin Details"
            editPath="/shipping"
            isOpen={openSections.origin}
            onToggle={() => toggleSection('origin')}
          >
            <OriginDetails origin={fullTransaction.shipmentDetails?.origin} />
          </ReviewSection>

          <ReviewSection
            title="Destination Details"
            editPath="/shipping"
            isOpen={openSections.destination}
            onToggle={() => toggleSection('destination')}
          >
            <DestinationDetails destination={fullTransaction.shipmentDetails?.destination} />
          </ReviewSection>

          <ReviewSection
            title="Package Details"
            editPath="/shipping"
            isOpen={openSections.package}
            onToggle={() => toggleSection('package')}
          >
            <PackageDetails 
              packageInfo={fullTransaction.shipmentDetails?.package} 
              deliveryPreferences={fullTransaction.shipmentDetails?.deliveryPreferences}
            />
          </ReviewSection>

          <ReviewSection
            title="Pricing Breakdown"
            editPath="/shipping/pricing"
            isOpen={openSections.pricing}
            onToggle={() => toggleSection('pricing')}
          >
            <PricingBreakdown pricing={fullTransaction.selectedOption?.pricing} />
          </ReviewSection>

          <ReviewSection
            title="Payment Information"
            editPath="/shipping/payment"
            isOpen={openSections.payment}
            onToggle={() => toggleSection('payment')}
          >
            <PaymentInformation paymentInfo={fullTransaction.paymentInfo} />
          </ReviewSection>

          <ReviewSection
            title="Pickup Schedule"
            editPath="/shipping/pickup"
            isOpen={openSections.pickup}
            onToggle={() => toggleSection('pickup')}
          >
            <PickupSchedule pickupDetails={fullTransaction.pickupDetails} />
          </ReviewSection>
        </div>

        {/* Terms and Conditions Section */}
        <TermsAndConditions
          transaction={fullTransaction}
          acknowledgment={termsAcknowledgment}
          onAcknowledgmentChange={setTermsAcknowledgment}
          errors={validationResult?.errors.reduce((acc, error) => {
            acc[error.field] = error.message;
            return acc;
          }, {} as Record<string, string>)}
        />

        {/* Validation Results */}
        {validationResult && (
          <ValidationErrors
            validationResult={validationResult}
            onRetryValidation={handleRetryValidation}
          />
        )}

        {/* Submission Error */}
        {submissionError && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Submission Failed</h3>
              </div>
              <p className="text-red-700 mt-1">{submissionError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmissionError(null)}
                className="mt-3"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/shipping')}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Shipment
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrintSummary}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Summary
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={handleStartOver}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!validationResult?.isValid || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : validationResult?.isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Shipment
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Resolve Issues First
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Submission Status */}
          {validationResult && !validationResult.isValid && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {SubmissionValidator.getErrorSummary(validationResult)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
