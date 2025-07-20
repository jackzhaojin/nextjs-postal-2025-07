'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Truck, Plane, Package } from 'lucide-react';

export default function PricingOptionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Pricing & Options
        </h1>
        <p className="text-muted-foreground">
          Compare shipping options and select the service that best fits your needs.
        </p>
      </div>

      {/* Pricing Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-600">
              Pricing will be calculated based on your shipment details
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ground Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            Ground Shipping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Ground shipping options will be displayed here
          </div>
        </CardContent>
      </Card>

      {/* Air Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600" />
            Air Express
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Air express options will be displayed here
          </div>
        </CardContent>
      </Card>

      {/* Freight Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Freight Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Freight service options will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
