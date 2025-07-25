'use client';

import React, { useState, useEffect } from 'react';
import { Address } from '@/lib/types';

interface ClientOnlyAddressDisplayProps {
  addressInfo: Address;
  className?: string;
}

/**
 * Client-only component to display address information
 * Prevents hydration mismatches by only rendering after hydration
 */
export function ClientOnlyAddressDisplay({ 
  addressInfo, 
  className = '' 
}: ClientOnlyAddressDisplayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything during SSR
  if (!isClient) {
    return (
      <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Pickup Address Confirmation
        </h4>
        <div className="text-sm text-blue-800">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Loading address information...
        </p>
      </div>
    );
  }

  // Render actual content after hydration
  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-blue-900 mb-2">
        Pickup Address Confirmation
      </h4>
      <div className="text-sm text-blue-800">
        <p>{addressInfo.address}</p>
        {addressInfo.suite && <p>Suite: {addressInfo.suite}</p>}
        <p>{addressInfo.city}, {addressInfo.state} {addressInfo.zip}</p>
      </div>
      <p className="text-xs text-blue-700 mt-2">
        This address was entered in Step 1. To modify, please return to the Shipment Details step.
      </p>
    </div>
  );
}
