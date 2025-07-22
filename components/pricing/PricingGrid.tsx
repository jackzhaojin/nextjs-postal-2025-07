/**
 * PricingGrid Component - Master Container for Pricing Display
 * Orchestrates quote fetching, categorization, and selection management
 */

import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, AlertTriangle, Package } from 'lucide-react';
import { PricingGridProps, ServiceCategory, PricingFilters } from './types';
import { PricingOption, ShipmentDetails } from '@/lib/types';
import { usePricingQuotes, usePricingSelection } from './hooks';
import PricingCategory from './PricingCategory';

interface PricingGridWrapperProps {
  shipmentDetails: ShipmentDetails | null;
  onQuoteSelected?: (quote: PricingOption) => void;
  initialSelectedQuote?: PricingOption | null;
}

export function PricingGrid({
  shipmentDetails,
  onQuoteSelected,
  initialSelectedQuote
}: PricingGridWrapperProps) {

  console.log('[PricingGrid] Component initialized', {
    hasShipmentDetails: !!shipmentDetails,
    hasCallback: !!onQuoteSelected,
    hasInitialSelection: !!initialSelectedQuote
  });

  // State management
  const [filters, setFilters] = useState<PricingFilters>({});
  const [sortBy, setSortBy] = useState<'price' | 'speed' | 'rating' | 'carbon'>('price');
  const [groupBy, setGroupBy] = useState<'category' | 'price' | 'speed'>('category');

  // Hooks for quote and selection management
  const {
    quotes,
    loading,
    error,
    requestQuote,
    refreshQuotes,
    quotesExpiry,
    isExpired
  } = usePricingQuotes(shipmentDetails);

  const {
    selectedQuote,
    selectQuote,
    clearSelection,
    canProceed,
    selectionValidation
  } = usePricingSelection();

  // Service categories configuration
  const serviceCategories: ServiceCategory[] = useMemo(() => [
    {
      id: 'ground',
      name: 'Ground Service',
      description: 'Economical ground transportation for standard delivery',
      icon: ({ className }) => <Package className={className} />,
      defaultSort: 'price'
    },
    {
      id: 'air',
      name: 'Air Service',
      description: 'Faster air transportation for expedited delivery',
      icon: ({ className }) => <Package className={className} />,
      defaultSort: 'speed'
    },
    {
      id: 'freight',
      name: 'Freight Service',
      description: 'Heavy cargo and oversized shipment solutions',
      icon: ({ className }) => <Package className={className} />,
      defaultSort: 'price'
    }
  ], []);

  // Group quotes by category
  const categorizedQuotes = useMemo(() => {
    if (!quotes) return {};

    const grouped = quotes.reduce((acc, quote) => {
      if (!acc[quote.category]) {
        acc[quote.category] = [];
      }
      acc[quote.category].push(quote);
      return acc;
    }, {} as Record<string, PricingOption[]>);

    console.log('[PricingGrid] Quotes categorized', {
      totalQuotes: quotes.length,
      categories: Object.keys(grouped),
      distribution: Object.entries(grouped).map(([cat, quotes]) => ({ [cat]: quotes.length }))
    });

    return grouped;
  }, [quotes]);

  // Handle quote selection
  const handleQuoteSelection = (quote: PricingOption) => {
    console.log('[PricingGrid] Quote selected', {
      id: quote.id,
      serviceType: quote.serviceType,
      total: quote.pricing.total
    });

    selectQuote(quote);
    
    if (onQuoteSelected) {
      onQuoteSelected(quote);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log('[PricingGrid] Manual refresh triggered');
    await refreshQuotes();
  };

  // Handle retry on error
  const handleRetry = async () => {
    if (!shipmentDetails) {
      console.error('[PricingGrid] Cannot retry - no shipment details');
      return;
    }
    
    console.log('[PricingGrid] Retrying quote request');
    await requestQuote(shipmentDetails);
  };

  // Auto-refresh expired quotes
  useEffect(() => {
    if (isExpired && shipmentDetails && !loading) {
      console.log('[PricingGrid] Auto-refreshing expired quotes');
      refreshQuotes();
    }
  }, [isExpired, shipmentDetails, loading, refreshQuotes]);

  // Show loading state
  if (loading && !quotes) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Getting Your Quotes</h3>
          <p className="text-muted-foreground">
            Comparing rates across multiple carriers...
          </p>
        </div>
        
        {/* Loading skeletons */}
        <div className="space-y-8">
          {serviceCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !quotes) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            {error.retryable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show empty state
  if (!quotes || quotes.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Quotes Available</h3>
            <p className="text-sm mb-4">
              We couldn't find any shipping options for your requirements.
            </p>
            <Button onClick={handleRetry} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Available Shipping Options</h2>
          <p className="text-muted-foreground">
            {quotes.length} {quotes.length === 1 ? 'option' : 'options'} found
            {quotesExpiry && (
              <span className="ml-2">
                • Expires {quotesExpiry.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {isExpired && (
            <Alert className="inline-flex">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Quotes expired</AlertDescription>
            </Alert>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Service Categories */}
      <div className="space-y-8">
        {serviceCategories.map((category) => {
          const categoryQuotes = categorizedQuotes[category.id] || [];
          
          if (categoryQuotes.length === 0) {
            return null; // Skip empty categories
          }
          
          return (
            <PricingCategory
              key={category.id}
              category={category}
              quotes={categoryQuotes}
              selectedQuote={selectedQuote}
              onSelectQuote={handleQuoteSelection}
              loading={loading}
              sortBy={sortBy}
              filters={{ ...filters, category: category.id }}
            />
          );
        })}
      </div>

      {/* Selection summary */}
      {selectedQuote && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Selected Option</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {selectedQuote.serviceType} - {selectedQuote.carrier}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedQuote.transitDays} business days
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedQuote.pricing.total.toFixed(2)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="mt-1"
                >
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation errors */}
      {!selectionValidation.valid && selectionValidation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {selectionValidation.errors.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default PricingGrid;
