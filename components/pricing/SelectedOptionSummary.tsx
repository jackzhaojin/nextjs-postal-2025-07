/**
 * SelectedOptionSummary Component - Current Selection Display
 * Shows the currently selected shipping option with key details and actions
 */

import React, { memo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Plane, Package, Clock, Leaf, CheckCircle, Edit2, BarChart3 } from 'lucide-react';
import { PricingOption } from '@/lib/types';

export interface SelectedOptionSummaryProps {
  readonly selectedOption: PricingOption | null;
  readonly onChangeSelection: () => void;
  readonly onCompareWithOthers: () => void;
  readonly onProceedToPayment: () => void;
  readonly canProceed: boolean;
  readonly comparisonCount?: number;
}

export const SelectedOptionSummary = memo(function SelectedOptionSummary({
  selectedOption,
  onChangeSelection,
  onCompareWithOthers,
  onProceedToPayment,
  canProceed,
  comparisonCount = 0
}: SelectedOptionSummaryProps) {

  console.log('[SelectedOptionSummary] Rendering', {
    hasSelection: !!selectedOption,
    canProceed,
    comparisonCount
  });

  // Handle proceed to payment
  const handleProceed = useCallback(() => {
    if (!canProceed || !selectedOption) {
      console.log('[SelectedOptionSummary] Cannot proceed', { canProceed, hasSelection: !!selectedOption });
      return;
    }

    console.log('[SelectedOptionSummary] Proceeding to payment', {
      selectedOptionId: selectedOption.id,
      serviceType: selectedOption.serviceType
    });

    onProceedToPayment();
  }, [canProceed, selectedOption, onProceedToPayment]);

  // Get service icon
  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'ground':
        return <Truck className="h-5 w-5" />;
      case 'air':
        return <Plane className="h-5 w-5" />;
      case 'freight':
        return <Package className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // Get category colors
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'ground':
        return {
          text: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'air':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'freight':
        return {
          text: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        };
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error('[SelectedOptionSummary] Currency formatting failed', error);
      return `$${amount.toFixed(2)}`;
    }
  };

  // Format transit time
  const formatTransitTime = (days: number): string => {
    if (days === 1) return '1 business day';
    if (days < 1) return 'Same day';
    return `${days} business days`;
  };

  // No selection state
  if (!selectedOption) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Option Selected</h3>
            <p className="text-sm">
              Select a shipping option above to see your selection summary and proceed to payment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = getCategoryColors(selectedOption.category);

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}/30`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <div className="text-lg font-semibold">Selected Option</div>
              <div className="text-sm text-muted-foreground font-normal">
                Ready to proceed to payment
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={colors.text}>
              {getServiceIcon(selectedOption.category)}
            </div>
            <div>
              <div className="font-semibold text-lg">{selectedOption.serviceType}</div>
              <div className="text-sm text-muted-foreground">
                {selectedOption.carrier}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${colors.text}`}>
              {formatCurrency(selectedOption.pricing.total)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-end gap-1">
              <Clock className="h-3 w-3" />
              {formatTransitTime(selectedOption.transitDays)}
            </div>
          </div>
        </div>

        {/* Key Features */}
        {selectedOption.features && selectedOption.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOption.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {selectedOption.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{selectedOption.features.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Estimated Delivery */}
        {selectedOption.estimatedDelivery && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Estimated Delivery:</span>
              <div className="text-muted-foreground mt-0.5">
                {selectedOption.estimatedDelivery}
              </div>
            </div>
            {selectedOption.carbonFootprint && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Leaf className="h-3 w-3 text-green-600" />
                <span>{selectedOption.carbonFootprint} kg CO₂</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onChangeSelection}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Change Selection
          </Button>
          
          <Button
            variant="outline"
            onClick={onCompareWithOthers}
            className="flex items-center gap-2"
            disabled={comparisonCount === 0}
          >
            <BarChart3 className="h-4 w-4" />
            Compare Options
            {comparisonCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {comparisonCount}
              </Badge>
            )}
          </Button>
          
          <Button
            onClick={handleProceed}
            disabled={!canProceed}
            className="flex items-center gap-2 ml-auto"
          >
            Continue to Payment
            <Package className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default SelectedOptionSummary;