/**
 * PricingSorting Component - Sort Control Interface
 * Provides sorting options for pricing display
 */

import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SortOption, PricingSortingProps } from './types';
import { 
  ArrowUpDown, 
  DollarSign, 
  Clock, 
  Star, 
  Leaf,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export interface SortConfig {
  readonly key: SortOption;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly direction: 'asc' | 'desc';
  readonly description: string;
}

const SORT_OPTIONS: SortConfig[] = [
  {
    key: 'price-asc',
    label: 'Price: Low to High',
    icon: DollarSign,
    direction: 'asc',
    description: 'Most affordable options first'
  },
  {
    key: 'price-desc',
    label: 'Price: High to Low',
    icon: DollarSign,
    direction: 'desc',
    description: 'Premium options first'
  },
  {
    key: 'speed-asc',
    label: 'Speed: Fastest First',
    icon: Clock,
    direction: 'asc',
    description: 'Shortest transit time first'
  },
  {
    key: 'speed-desc',
    label: 'Speed: Slowest First',
    icon: Clock,
    direction: 'desc',
    description: 'Longest transit time first'
  },
  {
    key: 'rating-desc',
    label: 'Best Rated',
    icon: Star,
    direction: 'desc',
    description: 'Highest customer rating first'
  },
  {
    key: 'carbon-asc',
    label: 'Most Eco-Friendly',
    icon: Leaf,
    direction: 'asc',
    description: 'Lowest carbon footprint first'
  }
];

export const PricingSorting = memo(function PricingSorting({
  sortBy,
  onSortChange,
  resultCount,
  isCompact = false
}: PricingSortingProps) {

  console.log('[PricingSorting] Rendering sort controls', {
    sortBy,
    resultCount,
    isCompact
  });

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const sortOption = value as SortOption;
    console.log('[PricingSorting] Sort changed', { from: sortBy, to: sortOption });
    onSortChange(sortOption);
  }, [sortBy, onSortChange]);

  // Get current sort configuration
  const currentSort = SORT_OPTIONS.find(option => option.key === sortBy) || SORT_OPTIONS[0];

  // Get direction icon
  const DirectionIcon = currentSort.direction === 'asc' ? TrendingUp : TrendingDown;

  // Compact version for mobile or constrained spaces
  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = option.key === sortBy;
              
              return (
                <SelectItem key={option.key} value={option.key}>
                  <div className="flex items-center gap-2">
                    <OptionIcon className="h-3 w-3" />
                    <span>{option.label}</span>
                    {isSelected && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {resultCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className="space-y-4">
      {/* Sort Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Sort Options</h3>
        </div>
        {resultCount > 0 && (
          <Badge variant="outline">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Current Sort Display */}
      <div className="p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          <currentSort.icon className="h-4 w-4 text-foreground" />
          <DirectionIcon className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{currentSort.label}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {currentSort.description}
        </p>
      </div>

      {/* Sort Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SORT_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          const OptionDirectionIcon = option.direction === 'asc' ? TrendingUp : TrendingDown;
          const isSelected = option.key === sortBy;
          
          return (
            <Button
              key={option.key}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleSortChange(option.key)}
              className="justify-start h-auto p-3 text-left"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex items-center gap-1 mt-0.5">
                  <OptionIcon className="h-4 w-4" />
                  <OptionDirectionIcon className="h-3 w-3 opacity-60" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
});

export default PricingSorting;