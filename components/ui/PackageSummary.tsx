'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { PackageInfo, ShipmentDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Lightbulb, Eye, EyeOff, TrendingUp, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PackageSummaryProps {
  packageInfo: PackageInfo;
  shipmentDetails?: Partial<ShipmentDetails>;
  showOptimizations?: boolean;
  showCostImpact?: boolean;
  onOptimizationSelect?: (optimization: RecommendationItem) => void;
  className?: string;
}

interface RecommendationItem {
  id: string;
  type: 'packaging' | 'cost' | 'service' | 'risk';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  savings?: number;
  action?: string;
}

interface PackageVisualization {
  width: number;
  height: number;
  depth: number;
  volume: number;
  dimensionalWeight: number;
  billingWeight: number;
  oversized: boolean;
}

const PACKAGE_TYPE_CONFIGS = {
  envelope: { maxWeight: 1, maxVolume: 100, color: 'bg-blue-100 border-blue-300' },
  small: { maxWeight: 50, maxVolume: 1000, color: 'bg-green-100 border-green-300' },
  medium: { maxWeight: 150, maxVolume: 5000, color: 'bg-yellow-100 border-yellow-300' },
  large: { maxWeight: 500, maxVolume: 15000, color: 'bg-orange-100 border-orange-300' },
  pallet: { maxWeight: 2500, maxVolume: 100000, color: 'bg-purple-100 border-purple-300' },
  crate: { maxWeight: 5000, maxVolume: 200000, color: 'bg-red-100 border-red-300' }
};

export function PackageSummary({ 
  packageInfo, 
  shipmentDetails, 
  showOptimizations = true, 
  showCostImpact = true,
  onOptimizationSelect,
  className = ''
}: PackageSummaryProps) {
  console.log('PackageSummary: Rendering with packageInfo:', packageInfo);
  console.log('PackageSummary: Shipment details:', shipmentDetails);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);

  // Calculate package visualization data
  const visualization = useMemo((): PackageVisualization => {
    console.log('PackageSummary: Calculating visualization data');
    
    const length = packageInfo.dimensions?.length || 0;
    const width = packageInfo.dimensions?.width || 0;
    const height = packageInfo.dimensions?.height || 0;
    const actualWeight = packageInfo.weight?.value || 0;
    
    const volume = length * width * height;
    const dimensionalWeight = volume / 166; // Standard dimensional weight divisor
    const billingWeight = Math.max(actualWeight, dimensionalWeight);
    
    const typeConfig = PACKAGE_TYPE_CONFIGS[packageInfo.type as keyof typeof PACKAGE_TYPE_CONFIGS];
    const oversized = typeConfig ? (actualWeight > typeConfig.maxWeight || volume > typeConfig.maxVolume) : false;
    
    const result = {
      width: length,
      height,
      depth: width,
      volume,
      dimensionalWeight,
      billingWeight,
      oversized
    };
    
    console.log('PackageSummary: Visualization result:', result);
    return result;
  }, [packageInfo]);

  // Generate smart recommendations
  const recommendations = useMemo((): RecommendationItem[] => {
    console.log('PackageSummary: Generating recommendations');
    
    const recs: RecommendationItem[] = [];

    // Packaging optimization
    if (visualization.oversized) {
      recs.push({
        id: 'resize-package',
        type: 'packaging',
        title: 'Package Size Optimization',
        description: 'Your package exceeds size limits for the selected type. Consider using a larger package category.',
        impact: 'high',
        action: 'Upgrade Package Type'
      });
    }

    // Dimensional weight optimization
    if (visualization.dimensionalWeight > (packageInfo.weight?.value || 0) * 1.5) {
      recs.push({
        id: 'reduce-dimensions',
        type: 'cost',
        title: 'Reduce Dimensional Weight',
        description: 'Your package has excess space. Reducing dimensions could save on shipping costs.',
        impact: 'medium',
        savings: Math.round((visualization.dimensionalWeight - (packageInfo.weight?.value || 0)) * 2.5),
        action: 'Optimize Packaging'
      });
    }

    // Service recommendations
    if ((packageInfo.declaredValue || 0) > 1000 && !packageInfo.specialHandling?.includes('white-glove')) {
      recs.push({
        id: 'add-white-glove',
        type: 'service',
        title: 'High-Value Package Protection',
        description: 'Consider white glove service for packages over $1,000 for additional protection.',
        impact: 'medium',
        action: 'Add White Glove Service'
      });
    }

    // Risk mitigation
    if (packageInfo.specialHandling?.includes('fragile') && !packageInfo.specialHandling?.includes('this-side-up')) {
      recs.push({
        id: 'add-orientation',
        type: 'risk',
        title: 'Orientation Handling',
        description: 'Fragile items often benefit from "This Side Up" handling to prevent damage.',
        impact: 'low',
        action: 'Add This Side Up'
      });
    }

    console.log('PackageSummary: Generated recommendations:', recs);
    return recs;
  }, [packageInfo, visualization]);

  // Calculate estimated cost impact
  const costImpact = useMemo(() => {
    console.log('PackageSummary: Calculating cost impact');
    
    const baseRate = visualization.billingWeight * 2.5;
    const specialHandlingFees = (packageInfo.specialHandling?.length || 0) * 25;
    const insuranceFee = (packageInfo.declaredValue || 0) * 0.01;
    
    const estimated = baseRate + specialHandlingFees + insuranceFee;
    
    console.log('PackageSummary: Cost impact calculation:', {
      billingWeight: visualization.billingWeight,
      baseRate,
      specialHandlingFees,
      insuranceFee,
      estimated
    });
    
    return estimated;
  }, [packageInfo, visualization]);

  const handleOptimizationClick = useCallback((recommendation: RecommendationItem) => {
    console.log('PackageSummary: Optimization clicked:', recommendation);
    setSelectedOptimization(recommendation.id);
    onOptimizationSelect?.(recommendation);
  }, [onOptimizationSelect]);

  const toggleDetails = useCallback(() => {
    console.log('PackageSummary: Toggling details view');
    setShowDetails(prev => !prev);
  }, []);

  const getRecommendationIcon = (type: RecommendationItem['type']) => {
    switch (type) {
      case 'packaging': return <Package className="h-4 w-4" />;
      case 'cost': return <TrendingUp className="h-4 w-4" />;
      case 'service': return <Shield className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: RecommendationItem['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Summary
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDetails}
              className="text-sm"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Package Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Package Dimensions</h4>
              <div className={`relative p-4 rounded-lg border-2 ${PACKAGE_TYPE_CONFIGS[packageInfo.type as keyof typeof PACKAGE_TYPE_CONFIGS]?.color || 'bg-gray-100 border-gray-300'}`}>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {visualization.width}" × {visualization.height}" × {visualization.depth}"
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Volume: {Math.round(visualization.volume)} in³
                  </div>
                  {visualization.oversized && (
                    <Badge variant="destructive" className="mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Oversized
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Weight Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actual Weight:</span>
                  <span className="font-medium">{packageInfo.weight?.value || 0} {packageInfo.weight?.unit || 'lbs'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dimensional Weight:</span>
                  <span className="font-medium">{Math.round(visualization.dimensionalWeight * 10) / 10} lbs</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Billing Weight:</span>
                  <span className="font-bold">{Math.round(visualization.billingWeight * 10) / 10} lbs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <span className="text-sm text-gray-600">Type:</span>
              <div className="font-medium capitalize">{packageInfo.type}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Contents:</span>
              <div className="font-medium">{packageInfo.contents || 'Not specified'}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Value:</span>
              <div className="font-medium">${packageInfo.declaredValue?.toLocaleString() || 0}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Special Handling:</span>
              <div className="font-medium">{packageInfo.specialHandling?.length || 0} options</div>
            </div>
          </div>

          {showDetails && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium">Special Handling Options</h4>
              {packageInfo.specialHandling && packageInfo.specialHandling.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {packageInfo.specialHandling.map((option, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {option.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">No special handling selected</span>
              )}
              
              {showCostImpact && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Estimated Cost Impact</h5>
                  <div className="text-2xl font-bold text-blue-700">
                    ${Math.round(costImpact)}
                  </div>
                  <div className="text-sm text-blue-600">
                    Based on billing weight and selected options
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      {showOptimizations && recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec) => (
              <Alert key={rec.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h6 className="font-medium text-sm">{rec.title}</h6>
                      <Badge className={`text-xs ${getImpactColor(rec.impact)}`}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      {rec.description}
                      {rec.savings && (
                        <span className="text-green-600 font-medium ml-2">
                          Save ~${rec.savings}
                        </span>
                      )}
                    </AlertDescription>
                    {rec.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => handleOptimizationClick(rec)}
                      >
                        {rec.action}
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}