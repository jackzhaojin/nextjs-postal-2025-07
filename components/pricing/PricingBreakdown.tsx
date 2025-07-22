/**
 * PricingBreakdown Component - Detailed Cost Itemization Display
 * Shows expandable breakdown of pricing components with transparency
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { PricingBreakdownProps } from './types';
import { PricingOption } from '@/lib/types';

export function PricingBreakdown({
  breakdown,
  expanded,
  onToggleExpanded,
  showCalculationBasis = false,
  currencyFormat = {
    currency: 'USD',
    locale: 'en-US',
    precision: 2,
    showSymbol: true
  }
}: PricingBreakdownProps) {
  
  console.log('[PricingBreakdown] Rendering breakdown', {
    total: breakdown.total,
    expanded,
    showCalculationBasis
  });

  // Format currency values
  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat(currencyFormat.locale, {
        style: 'currency',
        currency: currencyFormat.currency,
        minimumFractionDigits: currencyFormat.precision,
        maximumFractionDigits: currencyFormat.precision,
      }).format(amount);
    } catch (error) {
      console.error('[PricingBreakdown] Currency formatting failed', error);
      return `$${amount.toFixed(2)}`;
    }
  };

  // Format percentage
  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  // Calculate breakdown items
  const breakdownItems = useMemo(() => {
    const items = [
      {
        label: 'Base Rate',
        amount: breakdown.baseRate,
        description: 'Standard shipping rate based on distance and weight'
      },
      {
        label: 'Fuel Surcharge',
        amount: breakdown.fuelSurcharge,
        percentage: breakdown.fuelSurchargePercentage,
        description: `${formatPercentage(breakdown.fuelSurchargePercentage)} of base rate`
      },
      {
        label: 'Insurance',
        amount: breakdown.insurance,
        percentage: breakdown.insurancePercentage,
        description: `${formatPercentage(breakdown.insurancePercentage)} of declared value`
      }
    ];

    // Add special handling if present
    if (breakdown.specialHandling > 0) {
      items.push({
        label: 'Special Handling',
        amount: breakdown.specialHandling,
        description: 'Additional fees for special handling requirements'
      });
    }

    // Add delivery confirmation if present
    if (breakdown.deliveryConfirmation > 0) {
      items.push({
        label: 'Delivery Confirmation',
        amount: breakdown.deliveryConfirmation,
        description: 'Signature required delivery confirmation'
      });
    }

    // Add taxes
    items.push({
      label: 'Taxes',
      amount: breakdown.taxes,
      percentage: breakdown.taxPercentage,
      description: `${formatPercentage(breakdown.taxPercentage)} tax rate`
    });

    return items;
  }, [breakdown]);

  return (
    <div className="space-y-2">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleExpanded}
        className="flex items-center gap-2 p-2 h-auto text-sm"
        aria-expanded={expanded}
        aria-controls="pricing-breakdown-content"
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {expanded ? 'Hide' : 'Show'} Price Breakdown
      </Button>

      {/* Expandable Content */}
      {expanded && (
        <Card className="border-muted" id="pricing-breakdown-content">
          <CardContent className="p-4 space-y-3">
            {/* Breakdown Items */}
            <div className="space-y-2">
              {breakdownItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.description && (
                      <div className="relative group">
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(item.amount)}
                    {item.percentage && (
                      <span className="text-muted-foreground ml-1">
                        ({formatPercentage(item.percentage)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-muted my-3" />

            {/* Total */}
            <div className="flex items-center justify-between py-1 font-semibold">
              <span>Total</span>
              <span className="text-lg">{formatCurrency(breakdown.total)}</span>
            </div>

            {/* Calculation Basis */}
            {showCalculationBasis && breakdown.calculationBasis && (
              <div className="mt-4 pt-3 border-t border-muted">
                <h4 className="text-sm font-medium mb-2">Calculation Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Distance:</span> {breakdown.calculationBasis.distance} miles
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {breakdown.calculationBasis.weight} lbs
                  </div>
                  {breakdown.calculationBasis.dimensionalWeight && (
                    <div>
                      <span className="font-medium">Dim Weight:</span> {breakdown.calculationBasis.dimensionalWeight} lbs
                    </div>
                  )}
                  {breakdown.calculationBasis.zone && (
                    <div>
                      <span className="font-medium">Zone:</span> {breakdown.calculationBasis.zone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PricingBreakdown;
