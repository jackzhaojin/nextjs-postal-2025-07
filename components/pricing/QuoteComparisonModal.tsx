/**
 * QuoteComparisonModal Component - Detailed Comparison Overlay
 * Full-screen modal for detailed option comparison on desktop, drawer on mobile
 */

import React, { memo, useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  ArrowRight, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Truck, 
  Plane, 
  Package, 
  Leaf, 
  Shield,
  Star,
  Info
} from 'lucide-react';
import { PricingOption } from '@/lib/types';
import PricingComparison from './PricingComparison';

export interface QuoteComparisonModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly comparisonOptions: PricingOption[];
  readonly selectedOption: PricingOption | null;
  readonly onSelectOption: (option: PricingOption) => void;
  readonly onRemoveFromComparison: (option: PricingOption) => void;
  readonly isMobile?: boolean;
  readonly maxComparisons?: number;
}

export const QuoteComparisonModal = memo(function QuoteComparisonModal({
  isOpen,
  onOpenChange,
  comparisonOptions,
  selectedOption,
  onSelectOption,
  onRemoveFromComparison,
  isMobile = false,
  maxComparisons = 3
}: QuoteComparisonModalProps) {

  console.log('[QuoteComparisonModal] Rendering modal', {
    isOpen,
    optionCount: comparisonOptions.length,
    hasSelection: !!selectedOption,
    isMobile
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'features'>('overview');

  // Handle option selection with modal close
  const handleSelectOption = useCallback((option: PricingOption) => {
    console.log('[QuoteComparisonModal] Option selected, closing modal', {
      optionId: option.id,
      serviceType: option.serviceType
    });
    
    onSelectOption(option);
    onOpenChange(false);
  }, [onSelectOption, onOpenChange]);

  // Handle removing option from comparison
  const handleRemoveOption = useCallback((option: PricingOption) => {
    console.log('[QuoteComparisonModal] Option removed from comparison', {
      optionId: option.id,
      remainingCount: comparisonOptions.length - 1
    });
    
    onRemoveFromComparison(option);
    
    // Close modal if no options left
    if (comparisonOptions.length <= 1) {
      onOpenChange(false);
    }
  }, [comparisonOptions.length, onRemoveFromComparison, onOpenChange]);

  // Handle modal close
  const handleClose = useCallback(() => {
    console.log('[QuoteComparisonModal] Modal closed by user');
    onOpenChange(false);
  }, [onOpenChange]);

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
      console.error('[QuoteComparisonModal] Currency formatting failed', error);
      return `$${amount.toFixed(2)}`;
    }
  }, []);

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

  // Calculate comparison insights
  const comparisonInsights = React.useMemo(() => {
    if (comparisonOptions.length < 2) return null;

    const costs = comparisonOptions.map(o => o.pricing.total);
    const transitTimes = comparisonOptions.map(o => o.transitDays);
    
    const cheapest = comparisonOptions.find(o => o.pricing.total === Math.min(...costs));
    const fastest = comparisonOptions.find(o => o.transitDays === Math.min(...transitTimes));
    const mostEco = comparisonOptions
      .filter(o => o.carbonFootprint)
      .sort((a, b) => (a.carbonFootprint || 0) - (b.carbonFootprint || 0))[0];

    const maxSavings = Math.max(...costs) - Math.min(...costs);
    const maxTimeDiff = Math.max(...transitTimes) - Math.min(...transitTimes);

    return {
      cheapest,
      fastest,
      mostEco,
      maxSavings,
      maxTimeDiff
    };
  }, [comparisonOptions]);

  // Content to be rendered in both modal and sheet
  const ComparisonContent = () => (
    <div className="space-y-6">
      {/* Header with insights */}
      {comparisonInsights && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Comparison Insights
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {comparisonInsights.cheapest && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-green-600" />
                <div>
                  <div className="font-medium">Cheapest</div>
                  <div className="text-muted-foreground">{comparisonInsights.cheapest.serviceType}</div>
                </div>
              </div>
            )}
            
            {comparisonInsights.fastest && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-600" />
                <div>
                  <div className="font-medium">Fastest</div>
                  <div className="text-muted-foreground">{comparisonInsights.fastest.serviceType}</div>
                </div>
              </div>
            )}
            
            {comparisonInsights.mostEco && (
              <div className="flex items-center gap-2">
                <Leaf className="h-3 w-3 text-green-600" />
                <div>
                  <div className="font-medium">Most Eco</div>
                  <div className="text-muted-foreground">{comparisonInsights.mostEco.serviceType}</div>
                </div>
              </div>
            )}
          </div>

          {(comparisonInsights.maxSavings > 0 || comparisonInsights.maxTimeDiff > 0) && (
            <div className="mt-3 pt-3 border-t border-muted">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {comparisonInsights.maxSavings > 0 && (
                  <span>Save up to {formatCurrency(comparisonInsights.maxSavings)}</span>
                )}
                {comparisonInsights.maxTimeDiff > 0 && (
                  <span>Speed difference: {comparisonInsights.maxTimeDiff} day{comparisonInsights.maxTimeDiff > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {(['overview', 'details', 'features'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            size="sm"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <PricingComparison
            options={comparisonOptions}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onRemoveOption={handleRemoveOption}
            showFeatureMatrix={false}
          />
        )}

        {activeTab === 'details' && (
          <PricingComparison
            options={comparisonOptions}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onRemoveOption={handleRemoveOption}
            showFeatureMatrix={true}
          />
        )}

        {activeTab === 'features' && (
          <div className="space-y-4">
            <h4 className="font-medium">Feature Comparison Matrix</h4>
            {/* Detailed feature comparison would go here */}
            <div className="text-center text-muted-foreground py-8">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Detailed feature comparison coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={handleClose} className="flex items-center gap-2">
          Continue Browsing
        </Button>
        
        {selectedOption && (
          <Button onClick={() => handleSelectOption(selectedOption)} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Proceed with {selectedOption.serviceType}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile version - Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] overflow-hidden flex flex-col"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Compare Options ({comparisonOptions.length})
            </SheetTitle>
            <SheetDescription>
              Detailed side-by-side comparison of your selected shipping options
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 mt-6">
            <ComparisonContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version - Dialog
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Compare Shipping Options
            </div>
            <Badge variant="outline">
              {comparisonOptions.length} of {maxComparisons} options
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Compare pricing, features, and delivery times to make the best choice for your shipment
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-6">
          <ComparisonContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default QuoteComparisonModal;