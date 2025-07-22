'use client';

import React, { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useShipping } from '@/components/providers/ShippingProvider';
import { PricingGrid } from '@/components/pricing';
import { PricingOption } from '@/lib/types';
import { ShippingTransactionManager } from '@/lib/localStorage';

export default function PricingPage() {
  const { transaction } = useShipping();

  console.log('[PricingPage] Component rendered', {
    hasShipmentDetails: !!transaction.shipmentDetails,
    hasSelectedOption: !!transaction.selectedOption,
    transactionStatus: transaction.status
  });

  // Handle quote selection
  const handleQuoteSelected = useCallback((quote: PricingOption) => {
    console.log('[PricingPage] Quote selected, updating transaction', {
      quoteId: quote.id,
      serviceType: quote.serviceType,
      total: quote.pricing.total
    });

    // Update the transaction with selected option
    const updatedTransaction = {
      ...transaction,
      selectedOption: quote,
      status: 'pricing' as const
    };

    // Save to localStorage
    const result = ShippingTransactionManager.save(updatedTransaction);
    if (!result.success) {
      console.error('[PricingPage] Failed to save updated transaction', result.error);
    }
  }, [transaction]);

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

      {/* Pricing Grid */}
      <PricingGrid
        shipmentDetails={transaction.shipmentDetails || null}
        onQuoteSelected={handleQuoteSelected}
        initialSelectedQuote={transaction.selectedOption || null}
      />
    </main>
  );
}
