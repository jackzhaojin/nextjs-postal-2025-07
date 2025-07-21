'use client';

import { useState, useEffect } from 'react';
import { PackageContentsCategory, SpecialHandlingType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Monitor, 
  Car, 
  Cog, 
  FileText, 
  Shirt, 
  Coffee, 
  Heart, 
  Sofa, 
  Package2, 
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContentsCategorySuggestion {
  category: PackageContentsCategory;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  suggestedHandling: SpecialHandlingType[];
  hazmatRisk: 'none' | 'low' | 'medium' | 'high';
  weightValidation?: {
    maxWeight: number;
    recommendedPackageType: string[];
  };
  riskFactors: string[];
  bestPractices: string[];
  costImpact: 'low' | 'medium' | 'high';
}

const contentsCatalog: ContentsCategorySuggestion[] = [
  {
    category: 'electronics',
    label: 'Electronics & Computer Equipment',
    description: 'Computers, phones, tablets, electronic components',
    icon: Monitor,
    suggestedHandling: ['fragile', 'this-side-up'],
    hazmatRisk: 'low',
    weightValidation: {
      maxWeight: 150,
      recommendedPackageType: ['small', 'medium', 'large']
    },
    riskFactors: ['Static damage', 'Impact damage', 'Moisture sensitivity'],
    bestPractices: ['Anti-static packaging', 'Original boxes preferred', 'Temperature stable'],
    costImpact: 'medium'
  },
  {
    category: 'automotive',
    label: 'Automotive Parts & Accessories',
    description: 'Car parts, fluids, batteries, tools',
    icon: Car,
    suggestedHandling: ['hazmat'],
    hazmatRisk: 'high',
    weightValidation: {
      maxWeight: 500,
      recommendedPackageType: ['medium', 'large', 'pallet']
    },
    riskFactors: ['Hazardous fluids', 'Heavy components', 'Sharp edges'],
    bestPractices: ['Check for fluids/batteries', 'Secure heavy items', 'Drain fluids when possible'],
    costImpact: 'high'
  },
  {
    category: 'industrial',
    label: 'Industrial Equipment & Machinery',
    description: 'Manufacturing equipment, tools, industrial supplies',
    icon: Cog,
    suggestedHandling: ['liftgate-pickup', 'liftgate-delivery'],
    hazmatRisk: 'medium',
    weightValidation: {
      maxWeight: 2500,
      recommendedPackageType: ['large', 'pallet', 'crate']
    },
    riskFactors: ['Heavy weight', 'Precision components', 'Oil/grease residue'],
    bestPractices: ['Crate for valuable items', 'Drain fluids', 'Document serial numbers'],
    costImpact: 'high'
  },
  {
    category: 'documents',
    label: 'Documents & Legal Papers',
    description: 'Contracts, certificates, confidential papers',
    icon: FileText,
    suggestedHandling: [],
    hazmatRisk: 'none',
    weightValidation: {
      maxWeight: 1,
      recommendedPackageType: ['envelope']
    },
    riskFactors: ['Water damage', 'Loss/theft'],
    bestPractices: ['Waterproof packaging', 'Signature required', 'Track carefully'],
    costImpact: 'low'
  },
  {
    category: 'clothing',
    label: 'Clothing & Textiles',
    description: 'Apparel, fabrics, soft goods',
    icon: Shirt,
    suggestedHandling: [],
    hazmatRisk: 'none',
    weightValidation: {
      maxWeight: 50,
      recommendedPackageType: ['small', 'medium']
    },
    riskFactors: ['Moisture damage', 'Wrinkles/crushing'],
    bestPractices: ['Moisture protection', 'Flat pack when possible'],
    costImpact: 'low'
  },
  {
    category: 'food',
    label: 'Food & Beverages',
    description: 'Perishables, packaged food, beverages',
    icon: Coffee,
    suggestedHandling: ['temperature-controlled'],
    hazmatRisk: 'medium',
    weightValidation: {
      maxWeight: 100,
      recommendedPackageType: ['small', 'medium', 'large']
    },
    riskFactors: ['Temperature sensitivity', 'Expiration dates', 'Liquid spills'],
    bestPractices: ['Climate control', 'Leak-proof packaging', 'Quick transit'],
    costImpact: 'high'
  },
  {
    category: 'medical',
    label: 'Medical Equipment & Supplies',
    description: 'Medical devices, pharmaceuticals, lab equipment',
    icon: Heart,
    suggestedHandling: ['fragile', 'temperature-controlled'],
    hazmatRisk: 'high',
    weightValidation: {
      maxWeight: 200,
      recommendedPackageType: ['small', 'medium', 'large']
    },
    riskFactors: ['Sterility requirements', 'Temperature control', 'Regulatory compliance'],
    bestPractices: ['FDA compliance', 'Chain of custody', 'Priority handling'],
    costImpact: 'high'
  },
  {
    category: 'furniture',
    label: 'Furniture & Home Goods',
    description: 'Furniture, appliances, home decor',
    icon: Sofa,
    suggestedHandling: ['white-glove', 'inside-delivery'],
    hazmatRisk: 'low',
    weightValidation: {
      maxWeight: 1000,
      recommendedPackageType: ['large', 'pallet', 'crate']
    },
    riskFactors: ['Size/weight', 'Damage to finish', 'Assembly required'],
    bestPractices: ['Professional packing', 'White glove service', 'Assembly notes'],
    costImpact: 'high'
  },
  {
    category: 'raw-materials',
    label: 'Raw Materials & Commodities',
    description: 'Chemicals, metals, bulk materials',
    icon: Package2,
    suggestedHandling: ['hazmat'],
    hazmatRisk: 'high',
    weightValidation: {
      maxWeight: 5000,
      recommendedPackageType: ['pallet', 'crate']
    },
    riskFactors: ['Chemical hazards', 'Heavy weight', 'Regulatory compliance'],
    bestPractices: ['Hazmat classification', 'SDS documentation', 'Proper labeling'],
    costImpact: 'high'
  },
  {
    category: 'other',
    label: 'Other / Custom Items',
    description: 'Items not fitting standard categories',
    icon: HelpCircle,
    suggestedHandling: [],
    hazmatRisk: 'medium',
    weightValidation: {
      maxWeight: 2500,
      recommendedPackageType: ['small', 'medium', 'large', 'pallet', 'crate']
    },
    riskFactors: ['Unknown characteristics', 'Special requirements'],
    bestPractices: ['Detailed description required', 'Conservative handling'],
    costImpact: 'medium'
  }
];

interface ContentsSelectorProps {
  value: PackageContentsCategory;
  onCategoryChange: (category: PackageContentsCategory) => void;
  onHandlingSuggestionsApply: (suggestions: SpecialHandlingType[]) => void;
  currentHandling: SpecialHandlingType[];
  currentWeight: number;
  className?: string;
}

export function ContentsSelector({
  value,
  onCategoryChange,
  onHandlingSuggestionsApply,
  currentHandling,
  currentWeight,
  className
}: ContentsSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ContentsCategorySuggestion | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  console.log('[ContentsSelector] Rendering with:', {
    value,
    currentHandling,
    currentWeight,
    selectedCategory: selectedCategory?.category
  });

  useEffect(() => {
    const category = contentsCatalog.find(cat => cat.category === value);
    setSelectedCategory(category || null);
    setShowRecommendations(!!category);
    console.log('[ContentsSelector] Category updated:', { value, category: category?.label });
  }, [value]);

  const handleCategorySelect = (category: ContentsCategorySuggestion) => {
    console.log('[ContentsSelector] Category selected:', { 
      category: category.category, 
      label: category.label,
      suggestedHandling: category.suggestedHandling 
    });
    
    setSelectedCategory(category);
    onCategoryChange(category.category);
    setShowRecommendations(true);
  };

  const applySuggestions = () => {
    if (!selectedCategory) return;
    
    const newSuggestions = selectedCategory.suggestedHandling.filter(
      suggestion => !currentHandling.includes(suggestion)
    );
    
    console.log('[ContentsSelector] Applying suggestions:', {
      current: currentHandling,
      suggested: selectedCategory.suggestedHandling,
      newSuggestions
    });
    
    if (newSuggestions.length > 0) {
      onHandlingSuggestionsApply([...currentHandling, ...newSuggestions]);
    }
  };

  const getCostImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHazmatRiskColor = (risk: string) => {
    switch (risk) {
      case 'none': return 'text-green-600 bg-green-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Package Contents Category
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contentsCatalog.map((category) => {
            const IconComponent = category.icon;
            const isSelected = value === category.category;
            
            return (
              <Card
                key={category.category}
                className={cn(
                  'p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:border-gray-300'
                )}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {category.label}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs', getCostImpactColor(category.costImpact))}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        {category.costImpact} cost
                      </Badge>
                      {category.hazmatRisk !== 'none' && (
                        <Badge 
                          variant="secondary"
                          className={cn('text-xs', getHazmatRiskColor(category.hazmatRisk))}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {category.hazmatRisk} risk
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {showRecommendations && selectedCategory && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Smart Recommendations for {selectedCategory.label}
              </h3>
            </div>
            {selectedCategory.suggestedHandling.length > 0 && (
              <Button
                onClick={applySuggestions}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply Suggestions
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Suggested Special Handling</h4>
              {selectedCategory.suggestedHandling.length > 0 ? (
                <div className="space-y-2">
                  {selectedCategory.suggestedHandling.map((handling) => (
                    <div key={handling} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 capitalize">
                        {handling.replace('-', ' ')}
                      </span>
                      {currentHandling.includes(handling) && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Applied
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No special handling typically required</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
              <div className="space-y-2">
                {selectedCategory.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm text-gray-700">{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
              <div className="space-y-2">
                {selectedCategory.bestPractices.map((practice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{practice}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Weight & Package Guidance</h4>
              {selectedCategory.weightValidation && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    <strong>Max Weight:</strong> {selectedCategory.weightValidation.maxWeight} lbs
                  </div>
                  {currentWeight > selectedCategory.weightValidation.maxWeight && (
                    <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-100 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        Weight exceeds typical range for this category
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-700">
                    <strong>Recommended Types:</strong> {selectedCategory.weightValidation.recommendedPackageType.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
