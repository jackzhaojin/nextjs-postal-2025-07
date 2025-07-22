'use client';

import React, { useState, useCallback } from 'react';
import { ShippingPreset, SHIPPING_PRESETS, PRESET_CATEGORIES } from '@/lib/presets/shipping-presets';
import { PresetCard } from './PresetCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  RotateCcw, 
  Filter, 
  ChevronDown,
  Star,
  Clock,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresetSelectorProps {
  selectedPresetId?: string;
  onPresetSelect: (preset: ShippingPreset | null) => void;
  isModified: boolean;
  modifiedFields?: string[];
  className?: string;
  showCategoryFilter?: boolean;
  showPopularFirst?: boolean;
}

export function PresetSelector({
  selectedPresetId,
  onPresetSelect,
  isModified,
  modifiedFields = [],
  className,
  showCategoryFilter = true,
  showPopularFirst = true
}: PresetSelectorProps) {
  console.log('🎯 [PRESET-SELECTOR] Rendering preset selector:', {
    selectedPresetId,
    isModified,
    modifiedFieldsCount: modifiedFields.length,
    totalPresets: SHIPPING_PRESETS.length
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePresetSelect = useCallback((preset: ShippingPreset) => {
    console.log('🎯 [PRESET-SELECTOR] Preset selected:', {
      presetId: preset.id,
      presetName: preset.name,
      category: preset.category
    });
    onPresetSelect(preset);
  }, [onPresetSelect]);

  const handleClearSelection = useCallback(() => {
    console.log('🎯 [PRESET-SELECTOR] Clearing preset selection');
    onPresetSelect(null);
  }, [onPresetSelect]);

  const filteredPresets = React.useMemo(() => {
    console.log('🎯 [PRESET-SELECTOR] Filtering presets:', {
      selectedCategory,
      showPopularFirst
    });

    let presets = [...SHIPPING_PRESETS];

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      presets = presets.filter(preset => preset.category === selectedCategory);
    }

    // Sort popular first if enabled
    if (showPopularFirst) {
      presets.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
    }

    console.log('🎯 [PRESET-SELECTOR] Filtered presets:', {
      count: presets.length,
      popularCount: presets.filter(p => p.isPopular).length
    });

    return presets;
  }, [selectedCategory, showPopularFirst]);

  const selectedPreset = selectedPresetId 
    ? SHIPPING_PRESETS.find(p => p.id === selectedPresetId)
    : undefined;

  const getPresetStats = () => {
    const popular = SHIPPING_PRESETS.filter(p => p.isPopular).length;
    const avgSavings = Math.round(
      SHIPPING_PRESETS.reduce((acc, p) => acc + (p.estimatedSavings || 0), 0) / SHIPPING_PRESETS.length
    );
    
    return { popular, avgSavings };
  };

  const { popular: popularCount, avgSavings } = getPresetStats();

  return (
    <Card 
      className={cn('transition-all duration-200', className)}
      data-testid="preset-selector"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Quick Start Presets
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Choose a preset to automatically fill common shipping scenarios
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )} />
          </Button>
        </div>

        {/* Preset Stats */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-gray-600">
              {popularCount} popular presets
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Average {avgSavings}% time savings
            </span>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Category Filter */}
          {showCategoryFilter && (
            <div className="mb-6" data-testid="category-filter">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Filter by Category</h4>
                {selectedCategory !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-sm"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                  data-testid="category-filter-all"
                >
                  All Categories ({SHIPPING_PRESETS.length})
                </Badge>
                {PRESET_CATEGORIES.map((category) => {
                  const count = SHIPPING_PRESETS.filter(p => p.category === category.value).length;
                  return (
                    <Badge
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category.value)}
                      data-testid={`category-filter-${category.value}`}
                    >
                      {category.label} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Selection Status */}
          {selectedPreset && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-blue-900">
                      Using: {selectedPreset.name}
                    </div>
                    <div 
                      className="text-sm text-blue-700"
                      data-testid="preset-status"
                    >
                      {isModified ? (
                        <>
                          Modified ({modifiedFields.length} field{modifiedFields.length !== 1 ? 's' : ''} changed)
                        </>
                      ) : (
                        'All preset values applied'
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  data-testid="clear-preset-button"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear Preset
                </Button>
              </div>
            </div>
          )}

          {!selectedPreset && (
            <div data-testid="preset-status">none</div>
          )}

          {/* No Presets Message */}
          {filteredPresets.length === 0 && (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No presets found
              </h3>
              <p className="text-gray-600">
                No presets match the selected category. Try selecting a different category.
              </p>
            </div>
          )}

          {/* Preset Grid */}
          {filteredPresets.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={selectedPresetId === preset.id}
                  isModified={selectedPresetId === preset.id && isModified}
                  onSelect={() => handlePresetSelect(preset)}
                />
              ))}
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">How presets work:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Select a preset to instantly fill all form fields with realistic shipping data</li>
              <li>• You can modify any values after selecting a preset</li>
              <li>• Popular presets are marked with a star and shown first</li>
              <li>• Clear the preset to return to manual entry mode</li>
            </ul>
          </div>

          {/* Accessibility announcements */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {selectedPreset && (
              isModified 
                ? `Preset ${selectedPreset.name} applied and modified with ${modifiedFields.length} changes`
                : `Preset ${selectedPreset.name} applied successfully`
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}