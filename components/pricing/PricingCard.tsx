/**
 * PricingCard Component - Individual Shipping Option Display
 * Interactive card for selecting shipping options with detailed information
 */

import React, { useState, useCallback, memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, Plane, Package, Clock, Leaf, Shield, Plus, Check } from 'lucide-react';
import { PricingCardProps } from './types';
import { PricingOption } from '@/lib/types';
import PricingBreakdown from './PricingBreakdown';

export const PricingCard = memo(function PricingCard({
  quote,
  selected,
  onSelect,
  showBreakdown = true,
  comparisonMode = false,
  highlightFeatures = [],
  disabled = false,
  variant = 'default',
  // New props for comparison functionality
  inComparison = false,
  onAddToComparison,
  onRemoveFromComparison,
  comparisonDisabled = false
}: PricingCardProps) {
  
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);

  console.log('[PricingCard] Rendering card', {
    id: quote.id,
    serviceType: quote.serviceType,
    selected,
    disabled,
    variant
  });

  // Handle card selection
  const handleSelection = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      console.log('[PricingCard] Selection blocked - card disabled');
      return;
    }
    
    // Don't handle selection if clicking on comparison controls
    const target = event.target as HTMLElement;
    if (target.closest('[data-comparison-control]')) {
      return;
    }
    
    event.preventDefault();
    console.log('[PricingCard] Card selected', { id: quote.id, serviceType: quote.serviceType });
    onSelect(quote);
  }, [quote, onSelect, disabled]);

  // Handle comparison toggle
  const handleComparisonToggle = useCallback((checked: boolean) => {
    if (comparisonDisabled) {
      console.log('[PricingCard] Comparison toggle blocked - disabled');
      return;
    }

    console.log('[PricingCard] Comparison toggled', { 
      id: quote.id, 
      checked, 
      previousInComparison: inComparison 
    });

    if (checked && onAddToComparison) {
      onAddToComparison(quote);
    } else if (!checked && onRemoveFromComparison) {
      onRemoveFromComparison(quote);
    }
  }, [quote, inComparison, onAddToComparison, onRemoveFromComparison, comparisonDisabled]);

  // Handle keyboard interaction
  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      console.log('[PricingCard] Card selected via keyboard', { id: quote.id });
      onSelect(quote);
    }
  }, [quote, onSelect, disabled]);

  // Toggle breakdown expansion
  const toggleBreakdown = useCallback(() => {
    setBreakdownExpanded(prev => !prev);
    console.log('[PricingCard] Breakdown toggled', { expanded: !breakdownExpanded });
  }, [breakdownExpanded]);

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

  // Get category color scheme
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'ground':
        return {
          text: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          hoverBorder: 'hover:border-green-300'
        };
      case 'air':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          hoverBorder: 'hover:border-blue-300'
        };
      case 'freight':
        return {
          text: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          hoverBorder: 'hover:border-purple-300'
        };
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          hoverBorder: 'hover:border-gray-300'
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
      console.error('[PricingCard] Currency formatting failed', error);
      return `$${amount.toFixed(2)}`;
    }
  };

  // Format transit time
  const formatTransitTime = (days: number): string => {
    if (days === 1) return '1 business day';
    if (days < 1) return 'Same day';
    return `${days} business days`;
  };

  const colors = getCategoryColors(quote.category);

  // Card styling based on state
  const cardClasses = [
    'transition-all duration-200 cursor-pointer',
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md',
    selected ? `border-2 ${colors.border} ${colors.bg}` : `border ${colors.hoverBorder}`,
    variant === 'featured' ? 'ring-2 ring-offset-2 ring-blue-500' : '',
    variant === 'compact' ? 'p-3' : 'p-4'
  ].join(' ');

  return (
    <Card 
      className={cardClasses}
      onClick={handleSelection}
      onKeyPress={handleKeyPress}
      tabIndex={disabled ? -1 : 0}
      role="radio"
      aria-checked={selected}
      aria-label={`${quote.serviceType} shipping option, ${formatCurrency(quote.pricing.total)}, ${formatTransitTime(quote.transitDays)}`}
    >
      <CardHeader className={variant === 'compact' ? 'pb-2' : 'pb-3'}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={colors.text}>
              {getServiceIcon(quote.category)}
            </div>
            <div>
              <div className="font-semibold text-base">{quote.serviceType}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {quote.carrier}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selected && (
              <Badge variant="secondary">
                Selected
              </Badge>
            )}
            
            {/* Comparison checkbox */}
            {(onAddToComparison || onRemoveFromComparison) && (
              <div 
                className="flex items-center" 
                data-comparison-control
                onClick={e => e.stopPropagation()}
              >
                <Checkbox
                  checked={inComparison}
                  onCheckedChange={handleComparisonToggle}
                  disabled={comparisonDisabled}
                  aria-label={`${inComparison ? 'Remove from' : 'Add to'} comparison`}
                  className="h-4 w-4"
                />
                <span className="ml-1 text-xs text-muted-foreground">
                  Compare
                </span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pt-0' : 'pt-0'}>
        {/* Price and Transit Time */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-2xl font-bold ${colors.text}`}>
              {formatCurrency(quote.pricing.total)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTransitTime(quote.transitDays)}
            </div>
          </div>
          
          {quote.estimatedDelivery && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Estimated Delivery</div>
              <div className="text-sm font-medium">{quote.estimatedDelivery}</div>
            </div>
          )}
        </div>

        {/* Features */}
        {quote.features && quote.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {quote.features.slice(0, 3).map((feature, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className={`text-xs ${
                    highlightFeatures.includes(feature) ? 'bg-yellow-50 border-yellow-200' : ''
                  }`}
                >
                  {feature}
                </Badge>
              ))}
              {quote.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{quote.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Carbon Footprint */}
        {quote.carbonFootprint && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Leaf className="h-3 w-3 text-green-600" />
            <span>{quote.carbonFootprint} kg CO₂</span>
          </div>
        )}

        {/* Pricing Breakdown */}
        {showBreakdown && (
          <PricingBreakdown
            breakdown={quote.pricing}
            expanded={breakdownExpanded}
            onToggleExpanded={toggleBreakdown}
            showCalculationBasis={comparisonMode}
            currencyFormat={{
              currency: 'USD',
              locale: 'en-US',
              precision: 2,
              showSymbol: true
            }}
          />
        )}
      </CardContent>
    </Card>
  );
});

export default PricingCard;
