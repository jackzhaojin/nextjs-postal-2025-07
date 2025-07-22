/**
 * PricingCategory Component - Service Category Container
 * Groups pricing options by service type with category-specific features
 */

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Plane, Package } from 'lucide-react';
import { PricingCategoryProps, ServiceCategory } from './types';
import { PricingOption } from '@/lib/types';
import PricingCard from './PricingCard';

export function PricingCategory({
  category,
  quotes,
  selectedQuote,
  onSelectQuote,
  loading,
  sortBy = 'price',
  filters
}: PricingCategoryProps) {

  console.log('[PricingCategory] Rendering category', {
    categoryId: category.id,
    quotesCount: quotes.length,
    selectedQuoteId: selectedQuote?.id,
    sortBy
  });

  // Filter and sort quotes for this category
  const processedQuotes = useMemo(() => {
    let filtered = [...quotes];

    // Apply filters
    if (filters) {
      if (filters.maxPrice) {
        filtered = filtered.filter(quote => quote.pricing.total <= filters.maxPrice!);
      }
      
      if (filters.maxTransitDays) {
        filtered = filtered.filter(quote => quote.transitDays <= filters.maxTransitDays!);
      }
      
      if (filters.carriers && filters.carriers.length > 0) {
        filtered = filtered.filter(quote => filters.carriers!.includes(quote.carrier));
      }
      
      if (filters.features && filters.features.length > 0) {
        filtered = filtered.filter(quote => 
          filters.features!.some(feature => quote.features.includes(feature))
        );
      }
    }

    // Sort quotes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricing.total - b.pricing.total;
        case 'speed':
          return a.transitDays - b.transitDays;
        case 'rating':
          // For now, sort by carrier name as proxy for rating
          return a.carrier.localeCompare(b.carrier);
        case 'carbon':
          const aCarbon = a.carbonFootprint || 999;
          const bCarbon = b.carbonFootprint || 999;
          return aCarbon - bCarbon;
        default:
          return 0;
      }
    });

    console.log('[PricingCategory] Quotes processed', {
      originalCount: quotes.length,
      filteredCount: filtered.length,
      sortBy
    });

    return filtered;
  }, [quotes, filters, sortBy]);

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
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
  const getCategoryColors = (categoryId: string) => {
    switch (categoryId) {
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

  // Get price range for category
  const priceRange = useMemo(() => {
    if (processedQuotes.length === 0) return null;
    
    const prices = processedQuotes.map(q => q.pricing.total);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };
    
    return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }, [processedQuotes]);

  // Get transit time range
  const transitRange = useMemo(() => {
    if (processedQuotes.length === 0) return null;
    
    const days = processedQuotes.map(q => q.transitDays);
    const minDays = Math.min(...days);
    const maxDays = Math.max(...days);
    
    const formatDays = (d: number) => d === 1 ? '1 day' : `${d} days`;
    
    return minDays === maxDays ? formatDays(minDays) : `${formatDays(minDays)} - ${formatDays(maxDays)}`;
  }, [processedQuotes]);

  const colors = getCategoryColors(category.id);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={colors.text}>
            {getCategoryIcon(category.id)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
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
    );
  }

  // Show empty state
  if (processedQuotes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={colors.text}>
            {getCategoryIcon(category.id)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">No options available</h4>
            <p className="text-sm">
              No {category.name.toLowerCase()} shipping options match your criteria.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={colors.text}>
            {getCategoryIcon(category.id)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        
        {/* Category Summary */}
        <div className="flex gap-2">
          {priceRange && (
            <Badge variant="outline" className="text-xs">
              {priceRange}
            </Badge>
          )}
          {transitRange && (
            <Badge variant="outline" className="text-xs">
              {transitRange}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {processedQuotes.length} {processedQuotes.length === 1 ? 'option' : 'options'}
          </Badge>
        </div>
      </div>

      {/* Quote Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedQuotes.map((quote) => (
          <PricingCard
            key={quote.id}
            quote={quote}
            selected={selectedQuote?.id === quote.id}
            onSelect={onSelectQuote}
            showBreakdown={true}
            comparisonMode={false}
            highlightFeatures={[]}
            variant="default"
          />
        ))}
      </div>
    </div>
  );
}

export default PricingCategory;
