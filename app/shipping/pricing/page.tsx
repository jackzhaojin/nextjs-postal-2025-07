'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck, Plane, Package } from 'lucide-react';
import { useShipping } from '@/components/providers/ShippingProvider';

export default function PricingPage() {
  const { transaction } = useShipping();

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Pricing & Options
        </h1>
        <p className="text-muted-foreground">
          Select your preferred shipping service and review pricing options.
        </p>
      </div>

      {/* Shipment Summary */}
      {transaction.shipmentDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Shipment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">From:</span>
                <div className="text-muted-foreground">
                  {transaction.shipmentDetails.origin?.city}, {transaction.shipmentDetails.origin?.state} {transaction.shipmentDetails.origin?.zip}
                </div>
              </div>
              <div>
                <span className="font-medium">To:</span>
                <div className="text-muted-foreground">
                  {transaction.shipmentDetails.destination?.city}, {transaction.shipmentDetails.destination?.state} {transaction.shipmentDetails.destination?.zip}
                </div>
              </div>
              <div>
                <span className="font-medium">Package:</span>
                <div className="text-muted-foreground">
                  {transaction.shipmentDetails.package?.type} - {transaction.shipmentDetails.package?.weight?.value} {transaction.shipmentDetails.package?.weight?.unit}
                </div>
              </div>
              <div>
                <span className="font-medium">Value:</span>
                <div className="text-muted-foreground">
                  ${transaction.shipmentDetails.package?.declaredValue} {transaction.shipmentDetails.package?.currency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mock Pricing Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-blue-200 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Ground Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">$24.99</div>
              <div className="text-sm text-muted-foreground">3-5 business days</div>
              <div className="text-sm">Standard ground delivery</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-200 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Express Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">$39.99</div>
              <div className="text-sm text-muted-foreground">2-3 business days</div>
              <div className="text-sm">Faster delivery</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-purple-600" />
              Overnight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">$59.99</div>
              <div className="text-sm text-muted-foreground">Next business day</div>
              <div className="text-sm">Premium delivery</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-muted-foreground">
        Pricing page - Step 2 implementation in progress
      </div>
    </main>
  );
}
