'use client';

import React from 'react';
import { ShippingPreset } from '@/lib/presets/shipping-presets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Heart, 
  Laptop, 
  Car, 
  FileText,
  Clock,
  MapPin,
  Package,
  CheckCircle2,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresetCardProps {
  preset: ShippingPreset;
  isSelected: boolean;
  isModified: boolean;
  onSelect: () => void;
  className?: string;
}

export function PresetCard({ 
  preset, 
  isSelected, 
  isModified, 
  onSelect, 
  className 
}: PresetCardProps) {
  console.log('📋 [PRESET-CARD] Rendering preset card:', {
    presetId: preset.id,
    presetName: preset.name,
    isSelected,
    isModified
  });

  const getCategoryIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (preset.category) {
      case 'manufacturing':
        return <Building2 {...iconProps} />;
      case 'healthcare':
        return <Heart {...iconProps} />;
      case 'technology':
        return <Laptop {...iconProps} />;
      case 'automotive':
        return <Car {...iconProps} />;
      case 'legal':
        return <FileText {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  const getCategoryColor = () => {
    switch (preset.category) {
      case 'manufacturing':
        return 'bg-blue-100 text-blue-800';
      case 'healthcare':
        return 'bg-red-100 text-red-800';
      case 'technology':
        return 'bg-purple-100 text-purple-800';
      case 'automotive':
        return 'bg-orange-100 text-orange-800';
      case 'legal':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = () => {
    if (isSelected && isModified) {
      return 'border-yellow-400 bg-yellow-50';
    } else if (isSelected) {
      return 'border-blue-500 bg-blue-50';
    } else {
      return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getPackageDisplayWeight = () => {
    const weight = preset.shipmentDetails.package.weight;
    return `${weight.value} ${weight.unit}`;
  };

  const getPackageDisplayDimensions = () => {
    const dims = preset.shipmentDetails.package.dimensions;
    return `${dims.length}"×${dims.width}"×${dims.height}"`;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        getStatusColor(),
        className
      )}
      onClick={onSelect}
      data-testid={`preset-card-${preset.id}`}
      data-selected={isSelected}
      data-category={preset.category}
      data-popular={preset.isPopular || false}
      role="button"
      aria-label={`Select ${preset.name} preset for ${preset.description}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              isSelected ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              {getCategoryIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                {preset.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {preset.description}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {isSelected && (
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            )}
            {preset.isPopular && (
              <Badge className="bg-amber-100 text-amber-800 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge 
            className={cn('text-xs', getCategoryColor())}
            data-testid={`preset-category-${preset.category}`}
          >
            {preset.category.charAt(0).toUpperCase() + preset.category.slice(1)}
          </Badge>
          
          {preset.estimatedSavings && (
            <div className="flex items-center text-green-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {preset.estimatedSavings}% time saved
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Route Information */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="truncate">
                <span className="font-medium">{preset.shipmentDetails.origin.city}, {preset.shipmentDetails.origin.state}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="font-medium">{preset.shipmentDetails.destination.city}, {preset.shipmentDetails.destination.state}</span>
              </div>
            </div>
          </div>

          {/* Package Summary */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Type</div>
              <div className="font-medium capitalize">
                {preset.shipmentDetails.package.type.replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Weight</div>
              <div className="font-medium">
                {getPackageDisplayWeight()}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Value</div>
              <div className="font-medium">
                {formatCurrency(preset.shipmentDetails.package.declaredValue, preset.shipmentDetails.package.currency)}
              </div>
            </div>
          </div>

          {/* Package Dimensions */}
          <div className="text-sm">
            <div className="text-gray-500">Dimensions</div>
            <div className="font-medium">
              {getPackageDisplayDimensions()}
            </div>
          </div>

          {/* Special Handling */}
          {preset.shipmentDetails.package.specialHandling && 
           preset.shipmentDetails.package.specialHandling.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-500 mb-1">Special Handling</div>
              <div className="flex flex-wrap gap-1">
                {preset.shipmentDetails.package.specialHandling.map((handling, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {handling.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicator */}
          {isSelected && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {isModified ? (
                  <>
                    <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-yellow-700 font-medium">
                      Modified from preset
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-700 font-medium">
                      Using preset values
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}