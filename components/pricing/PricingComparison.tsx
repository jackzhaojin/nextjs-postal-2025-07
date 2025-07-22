/**
 * PricingComparison Component - Side-by-Side Option Comparison
 * Displays multiple pricing options for detailed comparison
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  Plane, 
  Package, 
  Clock, 
  Leaf, 
  Shield, 
  ArrowRight,
  CheckCircle,
  X,
  DollarSign
} from 'lucide-react';
import { PricingOption } from '@/lib/types';

export interface PricingComparisonProps {
  readonly options: PricingOption[];
  readonly selectedOption: PricingOption | null;
  readonly onSelectOption: (option: PricingOption) => void;
  readonly onRemoveOption: (option: PricingOption) => void;
  readonly maxOptions?: number;
  readonly showFeatureMatrix?: boolean;
}

interface ComparisonFeature {
  readonly label: string;
  readonly key: keyof PricingOption | string;
  readonly type: 'text' | 'currency' | 'duration' | 'boolean' | 'badge';
  readonly format?: (value: any) => string;
}

export const PricingComparison = memo(function PricingComparison({
  options,
  selectedOption,
  onSelectOption,
  onRemoveOption,
  maxOptions = 3,
  showFeatureMatrix = true
}: PricingComparisonProps) {

  console.log('[PricingComparison] Rendering comparison', {
    optionCount: options.length,
    hasSelection: !!selectedOption,
    showFeatureMatrix
  });

  // Get service icon
  const getServiceIcon = useCallback((category: string) => {
    switch (category) {
      case 'ground':
        return <Truck className="h-4 w-4" />;
      case 'air':
        return <Plane className="h-4 w-4" />;
      case 'freight':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  }, []);

  // Get category colors
  const getCategoryColors = useCallback((category: string) => {
    switch (category) {
      case 'ground':
        return 'text-green-600';
      case 'air':
        return 'text-blue-600';
      case 'freight':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error('[PricingComparison] Currency formatting failed', error);
      return `$${amount.toFixed(2)}`;
    }
  }, []);

  // Format transit time
  const formatTransitTime = useCallback((days: number): string => {
    if (days === 1) return '1 business day';
    if (days < 1) return 'Same day';
    return `${days} business days`;
  }, []);

  // Format percentage
  const formatPercentage = useCallback((value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  }, []);

  // Comparison features matrix
  const comparisonFeatures: ComparisonFeature[] = useMemo(() => [
    {
      label: 'Total Cost',
      key: 'pricing.total',
      type: 'currency'
    },
    {
      label: 'Base Rate',
      key: 'pricing.baseRate',
      type: 'currency'
    },
    {
      label: 'Fuel Surcharge',
      key: 'pricing.fuelSurcharge',
      type: 'currency'
    },
    {
      label: 'Transit Time',
      key: 'transitDays',
      type: 'duration',
      format: formatTransitTime
    },
    {
      label: 'Estimated Delivery',
      key: 'estimatedDelivery',
      type: 'text'
    },
    {
      label: 'Carbon Footprint',
      key: 'carbonFootprint',
      type: 'text',
      format: (value: number) => value ? `${value} kg CO₂` : 'N/A'
    }
  ], [formatTransitTime]);

  // Get nested property value
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);

  // Calculate cost differences
  const costDifferences = useMemo(() => {
    if (options.length < 2) return {};
    
    const lowestCost = Math.min(...options.map(o => o.pricing.total));
    return options.reduce((acc, option) => {
      const difference = option.pricing.total - lowestCost;
      acc[option.id] = {
        amount: difference,
        percentage: lowestCost > 0 ? difference / lowestCost : 0,
        isLowest: difference === 0
      };
      return acc;
    }, {} as Record<string, { amount: number; percentage: number; isLowest: boolean }>);
  }, [options]);

  // Handle option selection
  const handleSelectOption = useCallback((option: PricingOption) => {
    console.log('[PricingComparison] Option selected from comparison', {
      optionId: option.id,
      serviceType: option.serviceType
    });
    onSelectOption(option);
  }, [onSelectOption]);

  // Handle option removal
  const handleRemoveOption = useCallback((option: PricingOption) => {
    console.log('[PricingComparison] Option removed from comparison', {
      optionId: option.id
    });
    onRemoveOption(option);
  }, [onRemoveOption]);

  if (options.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Options to Compare</h3>
            <p className="text-sm">
              Select 2-3 options using the "Compare" checkbox to see a detailed side-by-side comparison.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comparison Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Option Comparison</h3>
          <p className="text-sm text-muted-foreground">
            Compare {options.length} shipping options side by side
          </p>
        </div>
        <Badge variant="outline">
          {options.length} of {maxOptions} options
        </Badge>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = selectedOption?.id === option.id;
          const costDiff = costDifferences[option.id];
          const colors = getCategoryColors(option.category);

          return (
            <Card 
              key={option.id}
              className={`relative ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            >
              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOption(option)}
                className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${option.serviceType} from comparison`}
              >
                <X className="h-3 w-3" />
              </Button>

              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-2 pr-8">
                  <div className={colors}>
                    {getServiceIcon(option.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {option.serviceType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {option.carrier}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Cost and Cost Difference */}
                <div className="text-center">
                  <div className={`text-xl font-bold ${colors}`}>
                    {formatCurrency(option.pricing.total)}
                  </div>
                  {costDiff && !costDiff.isLowest && (
                    <div className="text-xs text-muted-foreground">
                      +{formatCurrency(costDiff.amount)} 
                      ({formatPercentage(costDiff.percentage)} more)
                    </div>
                  )}
                  {costDiff?.isLowest && (
                    <Badge variant="secondary" className="text-xs mt-1 bg-green-100 text-green-800">
                      Lowest Cost
                    </Badge>
                  )}
                </div>

                {/* Transit Time */}
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTransitTime(option.transitDays)}
                </div>

                {/* Key Features */}
                {option.features && option.features.length > 0 && (
                  <div className="space-y-1">
                    {option.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-2 w-2 text-green-600 flex-shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                    {option.features.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{option.features.length - 2} more features
                      </div>
                    )}
                  </div>
                )}

                {/* Carbon Footprint */}
                {option.carbonFootprint && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Leaf className="h-3 w-3 text-green-600" />
                    <span>{option.carbonFootprint} kg CO₂</span>
                  </div>
                )}

                <Separator />

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectOption(option)}
                  disabled={isSelected}
                  className="w-full"
                  variant={isSelected ? "secondary" : "default"}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      Select Option
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      {showFeatureMatrix && options.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detailed Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Feature</th>
                    {options.map((option) => (
                      <th key={option.id} className="text-center py-2 font-medium min-w-[120px]">
                        <div className="truncate" title={option.serviceType}>
                          {option.serviceType}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.label} className="border-b last:border-b-0">
                      <td className="py-3 font-medium text-muted-foreground">
                        {feature.label}
                      </td>
                      {options.map((option) => {
                        const value = getNestedValue(option, feature.key);
                        let displayValue: string;

                        switch (feature.type) {
                          case 'currency':
                            displayValue = typeof value === 'number' ? formatCurrency(value) : 'N/A';
                            break;
                          case 'duration':
                            displayValue = feature.format ? feature.format(value) : String(value);
                            break;
                          case 'boolean':
                            displayValue = value ? '✓' : '✗';
                            break;
                          default:
                            displayValue = feature.format ? feature.format(value) : (value ?? 'N/A');
                        }

                        const isSelected = selectedOption?.id === option.id;

                        return (
                          <td 
                            key={option.id} 
                            className={`py-3 text-center ${isSelected ? 'bg-blue-50 font-medium' : ''}`}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default PricingComparison;