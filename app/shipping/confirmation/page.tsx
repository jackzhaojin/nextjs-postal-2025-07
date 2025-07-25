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
  Home
} from 'lucide-react';
import { SubmissionResponse } from '@/lib/types';

export default function ConfirmationPage() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<SubmissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('ConfirmationPage - rendering');

  useEffect(() => {
    console.log('ConfirmationPage - useEffect triggered');
    
    // Get confirmation data from localStorage
    const confirmationData = localStorage.getItem('shipping-confirmation');
    
    if (confirmationData) {
      try {
        const parsed = JSON.parse(confirmationData);
        console.log('ConfirmationPage - Confirmation data loaded:', parsed);
        setConfirmation(parsed);
      } catch (error) {
        console.error('ConfirmationPage - Failed to parse confirmation data:', error);
        router.push('/shipping');
      }
    } else {
      console.log('ConfirmationPage - No confirmation data found, redirecting');
      router.push('/shipping');
    }
    
    setIsLoading(false);
  }, [router]);

  const handleCopyConfirmation = () => {
    if (confirmation?.confirmationNumber) {
      navigator.clipboard.writeText(confirmation.confirmationNumber);
      console.log('ConfirmationPage - Confirmation number copied');
    }
  };

  const handleStartNewShipment = () => {
    console.log('ConfirmationPage - Starting new shipment');
    localStorage.removeItem('shipping-transaction');
    localStorage.removeItem('shipping-confirmation');
    router.push('/shipping');
  };

  const handleTrackShipment = () => {
    if (confirmation?.carrierInfo?.trackingUrl) {
      console.log('ConfirmationPage - Opening tracking URL:', confirmation.carrierInfo.trackingUrl);
      window.open(confirmation.carrierInfo.trackingUrl, '_blank');
    }
  };

  if (isLoading) {
    console.log('ConfirmationPage - showing loading state');
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

  if (!confirmation) {
    console.log('ConfirmationPage - No confirmation data available');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Confirmation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            No shipment confirmation data found. Please create a new shipment.
          </p>
          <Button onClick={() => router.push('/shipping')}>
            Create New Shipment
          </Button>
        </div>
      </div>
    );
  }

  console.log('ConfirmationPage - rendering with confirmation:', confirmation);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Shipment Successfully Booked!</h1>
          <p className="text-lg text-muted-foreground">
            Your shipment has been confirmed and is ready for pickup
          </p>
        </div>

        {/* Confirmation Number */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">Confirmation Number</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl font-bold text-green-900 font-mono">
                {confirmation.confirmationNumber}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyConfirmation}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-green-700">
              Reference this number for any inquiries about your shipment
            </p>
            {confirmation.trackingNumber && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Tracking Number:</p>
                <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                  {confirmation.trackingNumber}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Shipment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shipment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">CARRIER</h4>
                <div className="flex items-center gap-2 mt-1">
                  {confirmation.carrierInfo.logo && (
                    <img 
                      src={confirmation.carrierInfo.logo} 
                      alt={confirmation.carrierInfo.name}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="font-medium">{confirmation.carrierInfo.name}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">TOTAL COST</h4>
                <p className="text-2xl font-bold text-primary mt-1">
                  ${confirmation.totalCost.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">STATUS</h4>
                <Badge className="mt-1 capitalize bg-green-100 text-green-800 border-green-300">
                  {confirmation.status}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">BOOKING TIME</h4>
                <p className="mt-1">
                  {new Date(confirmation.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">ESTIMATED DELIVERY</h4>
                <p className="text-lg font-medium mt-1">{confirmation.estimatedDelivery}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">DELIVERY STATUS</h4>
                <Badge variant="outline" className="mt-1">
                  On Schedule
                </Badge>
              </div>

              {confirmation.carrierInfo.trackingUrl && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">TRACKING</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTrackShipment}
                    className="gap-2 mt-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Track Shipment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Pickup Scheduled</h4>
                <p className="text-sm text-muted-foreground">
                  Your pickup contact will receive confirmation and instructions via email and SMS
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-amber-600" />
                </div>
                <h4 className="font-semibold mb-2">Driver Contact</h4>
                <p className="text-sm text-muted-foreground">
                  The driver will call 30 minutes before arrival for pickup confirmation
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Package Ready</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure your package is ready and accessible at the scheduled pickup time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Customer Support</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>1-800-555-SHIP (7447)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>support@globalexpress.com</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available 24/7 for assistance with your shipment
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Important Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep your confirmation number for reference</li>
                  <li>• Ensure authorized personnel are available for pickup</li>
                  <li>• Package must be ready at scheduled time</li>
                  <li>• Any changes must be made at least 2 hours in advance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Print Confirmation
          </Button>
          
          {confirmation.carrierInfo.trackingUrl && (
            <Button
              variant="outline"
              onClick={handleTrackShipment}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Track This Shipment
            </Button>
          )}
          
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
      </div>
    </div>
  );
}
