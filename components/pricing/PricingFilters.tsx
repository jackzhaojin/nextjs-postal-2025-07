/**
 * PricingFilters Component - Advanced Filtering Controls
 * Provides filtering functionality for pricing options
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Filter, 
  X, 
  DollarSign, 
  Clock, 
  Truck, 
  Leaf, 
  ChevronDown,
  RotateCcw,
  Settings
} from 'lucide-react';
import { PricingOption } from '@/lib/types';

export interface PricingFiltersState {
  readonly maxPrice?: number;
  readonly maxTransitDays?: number;
  readonly carriers?: readonly string[];
  readonly features?: readonly string[];
  readonly categories?: readonly string[];
  readonly ecoFriendly?: boolean;
  readonly excludeHazmat?: boolean;
}

export interface PricingFiltersProps {
  readonly filters: PricingFiltersState;
  readonly onFiltersChange: (filters: PricingFiltersState) => void;
  readonly options: PricingOption[];
  readonly activeFilterCount: number;
  readonly isMobile?: boolean;
}

export interface FilterSummary {
  readonly totalOptions: number;
  readonly filteredOptions: number;
  readonly priceRange: { min: number; max: number };
  readonly transitRange: { min: number; max: number };
  readonly availableCarriers: readonly string[];
  readonly availableFeatures: readonly string[];
  readonly availableCategories: readonly string[];
}

export const PricingFilters = memo(function PricingFilters({
  filters,
  onFiltersChange,
  options,
  activeFilterCount,
  isMobile = false
}: PricingFiltersProps) {

  console.log('[PricingFilters] Rendering filters', {
    activeFilterCount,
    totalOptions: options.length,
    isMobile
  });

  const [isOpen, setIsOpen] = useState(false);

  // Calculate filter summary from available options
  const filterSummary: FilterSummary = useMemo(() => {
    const prices = options.map(o => o.pricing.total);
    const transitTimes = options.map(o => o.transitDays);
    const carriers = Array.from(new Set(options.map(o => o.carrier)));
    const features = Array.from(new Set(options.flatMap(o => o.features || [])));
    const categories = Array.from(new Set(options.map(o => o.category)));

    return {
      totalOptions: options.length,
      filteredOptions: options.length, // This would be calculated after filtering
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      transitRange: {
        min: Math.min(...transitTimes),
        max: Math.max(...transitTimes)
      },
      availableCarriers: carriers,
      availableFeatures: features,
      availableCategories: categories
    };
  }, [options]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      console.error('[PricingFilters] Currency formatting failed', error);
      return `$${Math.round(amount)}`;
    }
  }, []);

  // Handle price range change
  const handlePriceRangeChange = useCallback((values: number[]) => {
    const maxPrice = values[0];
    console.log('[PricingFilters] Price range changed', { maxPrice });
    
    onFiltersChange({
      ...filters,
      maxPrice: maxPrice === filterSummary.priceRange.max ? undefined : maxPrice
    });
  }, [filters, onFiltersChange, filterSummary.priceRange.max]);

  // Handle transit time change
  const handleTransitTimeChange = useCallback((values: number[]) => {
    const maxTransitDays = values[0];
    console.log('[PricingFilters] Transit time changed', { maxTransitDays });
    
    onFiltersChange({
      ...filters,
      maxTransitDays: maxTransitDays === filterSummary.transitRange.max ? undefined : maxTransitDays
    });
  }, [filters, onFiltersChange, filterSummary.transitRange.max]);

  // Handle carrier filter
  const handleCarrierToggle = useCallback((carrier: string, checked: boolean) => {
    const currentCarriers = filters.carriers || [];
    const newCarriers = checked
      ? [...currentCarriers, carrier]
      : currentCarriers.filter(c => c !== carrier);

    console.log('[PricingFilters] Carrier filter toggled', { carrier, checked, newCarriers });

    onFiltersChange({
      ...filters,
      carriers: newCarriers.length > 0 ? newCarriers : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle category filter
  const handleCategoryToggle = useCallback((category: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);

    console.log('[PricingFilters] Category filter toggled', { category, checked, newCategories });

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle feature filter
  const handleFeatureToggle = useCallback((feature: string, checked: boolean) => {
    const currentFeatures = filters.features || [];
    const newFeatures = checked
      ? [...currentFeatures, feature]
      : currentFeatures.filter(f => f !== feature);

    console.log('[PricingFilters] Feature filter toggled', { feature, checked, newFeatures });

    onFiltersChange({
      ...filters,
      features: newFeatures.length > 0 ? newFeatures : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle boolean filters
  const handleBooleanFilter = useCallback((key: keyof PricingFiltersState, value: boolean) => {
    console.log('[PricingFilters] Boolean filter changed', { key, value });

    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  }, [filters, onFiltersChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    console.log('[PricingFilters] Clearing all filters');
    onFiltersChange({});
  }, [onFiltersChange]);

  // Get category display info
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'ground':
        return { name: 'Ground', icon: Truck };
      case 'air':
        return { name: 'Air', icon: Clock };
      case 'freight':
        return { name: 'Freight', icon: Truck };
      default:
        return { name: category, icon: Truck };
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Maximum Price
          </label>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(filters.maxPrice || filterSummary.priceRange.max)}
          </span>
        </div>
        <Slider
          value={[filters.maxPrice || filterSummary.priceRange.max]}
          onValueChange={handlePriceRangeChange}
          min={filterSummary.priceRange.min}
          max={filterSummary.priceRange.max}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(filterSummary.priceRange.min)}</span>
          <span>{formatCurrency(filterSummary.priceRange.max)}</span>
        </div>
      </div>

      {/* Transit Time Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Maximum Transit Time
          </label>
          <span className="text-sm text-muted-foreground">
            {filters.maxTransitDays || filterSummary.transitRange.max} days
          </span>
        </div>
        <Slider
          value={[filters.maxTransitDays || filterSummary.transitRange.max]}
          onValueChange={handleTransitTimeChange}
          min={filterSummary.transitRange.min}
          max={filterSummary.transitRange.max}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{filterSummary.transitRange.min} day{filterSummary.transitRange.min > 1 ? 's' : ''}</span>
          <span>{filterSummary.transitRange.max} days</span>
        </div>
      </div>

      {/* Service Categories */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Service Categories</label>
        <div className="space-y-2">
          {filterSummary.availableCategories.map((category) => {
            const categoryInfo = getCategoryInfo(category);
            const CategoryIcon = categoryInfo.icon;
            
            return (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories?.includes(category) || false}
                  onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <CategoryIcon className="h-3 w-3" />
                  {categoryInfo.name}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carriers Filter */}
      {filterSummary.availableCarriers.length > 1 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Carriers</label>
          <div className="space-y-2">
            {filterSummary.availableCarriers.map((carrier) => (
              <div key={carrier} className="flex items-center space-x-2">
                <Checkbox
                  id={`carrier-${carrier}`}
                  checked={filters.carriers?.includes(carrier) || false}
                  onCheckedChange={(checked) => handleCarrierToggle(carrier, !!checked)}
                />
                <label
                  htmlFor={`carrier-${carrier}`}
                  className="text-sm cursor-pointer"
                >
                  {carrier}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Filter */}
      {filterSummary.availableFeatures.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Required Features</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterSummary.availableFeatures.slice(0, 10).map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={filters.features?.includes(feature) || false}
                  onCheckedChange={(checked) => handleFeatureToggle(feature, !!checked)}
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className="text-sm cursor-pointer"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Filters */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Special Preferences</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="eco-friendly"
              checked={filters.ecoFriendly || false}
              onCheckedChange={(checked) => handleBooleanFilter('ecoFriendly', !!checked)}
            />
            <label htmlFor="eco-friendly" className="text-sm cursor-pointer flex items-center gap-2">
              <Leaf className="h-3 w-3 text-green-600" />
              Eco-friendly options only
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exclude-hazmat"
              checked={filters.excludeHazmat || false}
              onCheckedChange={(checked) => handleBooleanFilter('excludeHazmat', !!checked)}
            />
            <label htmlFor="exclude-hazmat" className="text-sm cursor-pointer">
              Exclude hazmat restrictions
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile version with sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Filter Options
            </SheetTitle>
            <SheetDescription>
              Refine your shipping options with advanced filters
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Options
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  );
});

export default PricingFilters;