'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { AddressInput } from '@/components/forms/AddressInput';
import { PackageInput } from '@/components/forms/PackageInput';
import { useShipping } from '@/components/providers/ShippingProvider';

export default function ShipmentDetailsPage() {
  const {
    transaction,
    errors,
    isValid,
    updateOrigin,
    updateDestination,
    updatePackage
  } = useShipping();

  const shipmentDetails = transaction.shipmentDetails;

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Shipment Details
        </h1>
        <p className="text-muted-foreground">
          Enter your package information and pickup/delivery addresses to get started.
        </p>
      </div>

      {/* Origin Address Section */}
      <AddressInput
        title="Pickup Address (Origin)"
        address={shipmentDetails?.origin || {}}
        onChange={updateOrigin}
        icon={<MapPin className="h-5 w-5" />}
        iconColor="text-blue-600"
        errors={Object.fromEntries(
          Object.entries(errors)
            .filter(([key]) => key.startsWith('origin.'))
            .map(([key, value]) => [key.replace('origin.', ''), value])
        )}
      />

      {/* Destination Address Section */}
      <AddressInput
        title="Delivery Address (Destination)"
        address={shipmentDetails?.destination || {}}
        onChange={updateDestination}
        icon={<MapPin className="h-5 w-5" />}
        iconColor="text-green-600"
        errors={Object.fromEntries(
          Object.entries(errors)
            .filter(([key]) => key.startsWith('destination.'))
            .map(([key, value]) => [key.replace('destination.', ''), value])
        )}
      />

      {/* Package Information Section */}
      <PackageInput
        packageInfo={shipmentDetails?.package || {}}
        onChange={updatePackage}
        errors={Object.fromEntries(
          Object.entries(errors)
            .filter(([key]) => key.startsWith('package.'))
            .map(([key, value]) => [key.replace('package.', ''), value])
        )}
      />

      {/* Business Rule Errors */}
      {errors['business.sameAddress'] && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="text-red-800 font-medium">
            {errors['business.sameAddress']}
          </div>
        </div>
      )}

      {/* Form Status */}
      <div className="text-sm text-muted-foreground">
        {isValid ? (
          <span className="text-green-600">✓ All required fields completed</span>
        ) : (
          <span>Please complete all required fields to continue</span>
        )}
      </div>
    </main>
  );
}
