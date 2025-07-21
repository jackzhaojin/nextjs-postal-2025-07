'use client';

import { useState, useEffect } from 'react';
import { MultiplePackageDetails, PackagePiece, PackageInfo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Package, 
  Weight, 
  DollarSign, 
  Calculator,
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  Truck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ConsolidationRecommendation {
  type: 'pallet' | 'ltl' | 'ftl' | 'combine';
  title: string;
  description: string;
  estimatedSavings: number;
  requirements: string[];
  pros: string[];
  cons: string[];
}

const packageTypeOptions = [
  { value: 'envelope', label: 'Envelope', maxWeight: 1 },
  { value: 'small', label: 'Small Package', maxWeight: 50 },
  { value: 'medium', label: 'Medium Package', maxWeight: 150 },
  { value: 'large', label: 'Large Package', maxWeight: 500 },
  { value: 'pallet', label: 'Pallet', maxWeight: 2500 },
  { value: 'crate', label: 'Crate/Custom', maxWeight: 5000 }
];

interface MultiplePackagesFormProps {
  value: MultiplePackageDetails | null;
  onChange: (details: MultiplePackageDetails | null) => void;
  mainPackageType: PackageInfo['type'];
  className?: string;
}

export function MultiplePackagesForm({
  value,
  onChange,
  mainPackageType,
  className
}: MultiplePackagesFormProps) {
  const [recommendations, setRecommendations] = useState<ConsolidationRecommendation[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showOptimization, setShowOptimization] = useState(false);

  console.log('[MultiplePackagesForm] Rendering with:', {
    value,
    mainPackageType,
    recommendations: recommendations.length
  });

  useEffect(() => {
    if (value && value.pieces.length > 0) {
      generateRecommendations();
      validatePackages();
    }
  }, [value]);

  const generateRecommendations = () => {
    if (!value) return;

    const newRecommendations: ConsolidationRecommendation[] = [];
    const totalWeight = value.totalWeight;
    const totalValue = value.totalDeclaredValue;
    const pieceCount = value.numberOfPieces;

    // Pallet consolidation recommendation
    if (pieceCount >= 3 && totalWeight > 100 && totalWeight <= 2500) {
      newRecommendations.push({
        type: 'pallet',
        title: 'Pallet Consolidation',
        description: 'Combine multiple pieces on a single pallet for better handling',
        estimatedSavings: Math.min(50 + (pieceCount * 5), 200),
        requirements: ['Stackable packages', 'Compatible dimensions', 'Pallet-friendly packaging'],
        pros: ['Reduced handling', 'Lower damage risk', 'Freight pricing'],
        cons: ['Single delivery point', 'Pallet return responsibility']
      });
    }

    // LTL recommendation
    if (totalWeight > 150 && totalWeight <= 10000 && pieceCount <= 20) {
      newRecommendations.push({
        type: 'ltl',
        title: 'Less Than Truckload (LTL)',
        description: 'Ship as freight for better rates and handling',
        estimatedSavings: Math.floor(totalWeight * 0.5),
        requirements: ['Commercial pickup/delivery', 'Freight-ready packaging'],
        pros: ['Lower cost per pound', 'Better for heavy items', 'Dock-to-dock service'],
        cons: ['Longer transit time', 'Commercial addresses preferred']
      });
    }

    // Package combination recommendation
    if (pieceCount >= 2 && pieceCount <= 5) {
      const combinablePackages = value.pieces.filter(piece => piece.weight.value <= 20);
      if (combinablePackages.length >= 2) {
        newRecommendations.push({
          type: 'combine',
          title: 'Package Combination',
          description: 'Combine smaller pieces into fewer packages',
          estimatedSavings: pieceCount * 15,
          requirements: ['Compatible contents', 'Total weight under 50 lbs'],
          pros: ['Fewer handling fees', 'Simpler tracking', 'Reduced loss risk'],
          cons: ['Single point of failure', 'Mixed contents']
        });
      }
    }

    // Full truckload recommendation
    if (totalWeight > 10000 || pieceCount > 30) {
      newRecommendations.push({
        type: 'ftl',
        title: 'Full Truckload (FTL)',
        description: 'Dedicated truck for large shipments',
        estimatedSavings: Math.floor(totalWeight * 0.3),
        requirements: ['Minimum 10,000 lbs or 12+ pallets', 'Loading dock access'],
        pros: ['Best freight rates', 'Fastest transit', 'Dedicated service'],
        cons: ['High minimum weight', 'Dock requirements']
      });
    }

    setRecommendations(newRecommendations);
    console.log('[MultiplePackagesForm] Generated recommendations:', newRecommendations.length);
  };

  const validatePackages = () => {
    if (!value) return;

    const errors: Record<string, string> = {};

    // Validate total count
    if (value.numberOfPieces !== value.pieces.length) {
      errors.count = 'Number of pieces does not match actual pieces entered';
    }

    // Validate weight limits
    if (value.totalWeight > 10000) {
      errors.weight = 'Total weight exceeds 10,000 lbs maximum';
    }

    // Validate individual pieces
    value.pieces.forEach((piece, index) => {
      const typeOption = packageTypeOptions.find(opt => opt.value === piece.type);
      if (typeOption && piece.weight.value > typeOption.maxWeight) {
        errors[`piece_${index}_weight`] = `Weight exceeds ${typeOption.maxWeight} lbs limit for ${typeOption.label}`;
      }
    });

    setValidationErrors(errors);
  };

  const initializeMultiplePackages = () => {
    const initialDetails: MultiplePackageDetails = {
      numberOfPieces: 2,
      pieces: [
        {
          id: 'piece-1',
          type: 'small',
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          weight: { value: 5, unit: 'lbs' },
          description: '',
          declaredValue: 100
        },
        {
          id: 'piece-2',
          type: 'small',
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          weight: { value: 5, unit: 'lbs' },
          description: '',
          declaredValue: 100
        }
      ],
      totalWeight: 10,
      totalDeclaredValue: 200
    };
    
    onChange(initialDetails);
    console.log('[MultiplePackagesForm] Initialized multiple packages');
  };

  const addPackage = () => {
    if (!value) return;

    const newPiece: PackagePiece = {
      id: `piece-${value.pieces.length + 1}`,
      type: 'small',
      dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
      weight: { value: 5, unit: 'lbs' },
      description: '',
      declaredValue: 100
    };

    const updatedDetails: MultiplePackageDetails = {
      ...value,
      numberOfPieces: value.numberOfPieces + 1,
      pieces: [...value.pieces, newPiece],
      totalWeight: value.totalWeight + newPiece.weight.value,
      totalDeclaredValue: value.totalDeclaredValue + newPiece.declaredValue
    };

    onChange(updatedDetails);
    console.log('[MultiplePackagesForm] Added package:', newPiece.id);
  };

  const removePackage = (index: number) => {
    if (!value || value.pieces.length <= 1) return;

    const removedPiece = value.pieces[index];
    const updatedPieces = value.pieces.filter((_, i) => i !== index);

    const updatedDetails: MultiplePackageDetails = {
      ...value,
      numberOfPieces: updatedPieces.length,
      pieces: updatedPieces,
      totalWeight: value.totalWeight - removedPiece.weight.value,
      totalDeclaredValue: value.totalDeclaredValue - removedPiece.declaredValue
    };

    onChange(updatedDetails);
    console.log('[MultiplePackagesForm] Removed package:', removedPiece.id);
  };

  const duplicatePackage = (index: number) => {
    if (!value || value.pieces.length >= 50) return;

    const originalPiece = value.pieces[index];
    const duplicatedPiece: PackagePiece = {
      ...originalPiece,
      id: `piece-${value.pieces.length + 1}`,
      description: `${originalPiece.description} (copy)`
    };

    const updatedDetails: MultiplePackageDetails = {
      ...value,
      numberOfPieces: value.numberOfPieces + 1,
      pieces: [...value.pieces, duplicatedPiece],
      totalWeight: value.totalWeight + duplicatedPiece.weight.value,
      totalDeclaredValue: value.totalDeclaredValue + duplicatedPiece.declaredValue
    };

    onChange(updatedDetails);
    console.log('[MultiplePackagesForm] Duplicated package:', originalPiece.id);
  };

  const updatePiece = (index: number, field: keyof PackagePiece, fieldValue: any) => {
    if (!value) return;

    const updatedPieces = [...value.pieces];
    const oldPiece = updatedPieces[index];
    
    // Update the specific field
    if (field === 'weight') {
      updatedPieces[index] = { ...oldPiece, weight: fieldValue };
    } else if (field === 'dimensions') {
      updatedPieces[index] = { ...oldPiece, dimensions: fieldValue };
    } else {
      updatedPieces[index] = { ...oldPiece, [field]: fieldValue };
    }

    // Recalculate totals
    const newTotalWeight = updatedPieces.reduce((sum, piece) => sum + piece.weight.value, 0);
    const newTotalValue = updatedPieces.reduce((sum, piece) => sum + piece.declaredValue, 0);

    const updatedDetails: MultiplePackageDetails = {
      ...value,
      pieces: updatedPieces,
      totalWeight: newTotalWeight,
      totalDeclaredValue: newTotalValue
    };

    onChange(updatedDetails);
    console.log('[MultiplePackagesForm] Updated piece:', { index, field, value: fieldValue });
  };

  const clearMultiplePackages = () => {
    onChange(null);
    console.log('[MultiplePackagesForm] Cleared multiple packages');
  };

  if (mainPackageType !== 'multiple' && !value) {
    return null;
  }

  if (!value) {
    return (
      <Card className="p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Multiple Packages Mode
          </h3>
          <p className="text-gray-600 mb-4">
            Ship multiple packages together for consolidated handling and potential cost savings.
          </p>
          <Button onClick={initializeMultiplePackages}>
            <Plus className="h-4 w-4 mr-2" />
            Start Multiple Packages
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Multiple Packages ({value.numberOfPieces} pieces)
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {recommendations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOptimization(!showOptimization)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Optimization Tips
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearMultiplePackages}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Switch to Single Package
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{value.numberOfPieces}</div>
              <div className="text-sm text-gray-600">Total Pieces</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Weight className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{value.totalWeight}</div>
              <div className="text-sm text-gray-600">Total Weight (lbs)</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">${value.totalDeclaredValue}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {Object.values(validationErrors).map((error, index) => (
                <div key={index} className="text-sm">• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Optimization Recommendations */}
      {showOptimization && recommendations.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Cost Optimization Recommendations
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="p-4 bg-white border-blue-200">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{rec.title}</h5>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Save ${rec.estimatedSavings}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <h6 className="text-xs font-medium text-gray-900">Requirements:</h6>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {rec.requirements.map((req, i) => (
                        <li key={i} className="flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <h6 className="text-xs font-medium text-green-700">Pros:</h6>
                      <ul className="text-xs text-green-600 space-y-1">
                        {rec.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="text-xs font-medium text-red-700">Cons:</h6>
                      <ul className="text-xs text-red-600 space-y-1">
                        {rec.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Package List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Package Details</h4>
          <Button
            onClick={addPackage}
            disabled={value.pieces.length >= 50}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {value.pieces.map((piece, index) => (
          <Card key={piece.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-900">
                Package {index + 1} ({piece.id})
              </h5>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicatePackage(index)}
                  disabled={value.pieces.length >= 50}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removePackage(index)}
                  disabled={value.pieces.length <= 1}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Package Type */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Package Type</Label>
                <Select
                  value={piece.type}
                  onValueChange={(type) => updatePiece(index, 'type', type)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packageTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} (up to {option.maxWeight} lbs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Weight</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={piece.weight.value}
                    onChange={(e) => updatePiece(index, 'weight', {
                      ...piece.weight,
                      value: parseFloat(e.target.value) || 0
                    })}
                    className={cn(
                      'flex-1',
                      validationErrors[`piece_${index}_weight`] && 'border-red-300'
                    )}
                  />
                  <Select
                    value={piece.weight.unit}
                    onValueChange={(unit) => updatePiece(index, 'weight', {
                      ...piece.weight,
                      unit
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {validationErrors[`piece_${index}_weight`] && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors[`piece_${index}_weight`]}
                  </p>
                )}
              </div>

              {/* Declared Value */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Declared Value</Label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    value={piece.declaredValue}
                    onChange={(e) => updatePiece(index, 'declaredValue', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Dimensions (L × W × H)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Input
                  type="number"
                  placeholder="Length"
                  min="0.1"
                  step="0.1"
                  value={piece.dimensions.length}
                  onChange={(e) => updatePiece(index, 'dimensions', {
                    ...piece.dimensions,
                    length: parseFloat(e.target.value) || 0
                  })}
                />
                <Input
                  type="number"
                  placeholder="Width"
                  min="0.1"
                  step="0.1"
                  value={piece.dimensions.width}
                  onChange={(e) => updatePiece(index, 'dimensions', {
                    ...piece.dimensions,
                    width: parseFloat(e.target.value) || 0
                  })}
                />
                <Input
                  type="number"
                  placeholder="Height"
                  min="0.1"
                  step="0.1"
                  value={piece.dimensions.height}
                  onChange={(e) => updatePiece(index, 'dimensions', {
                    ...piece.dimensions,
                    height: parseFloat(e.target.value) || 0
                  })}
                />
                <Select
                  value={piece.dimensions.unit}
                  onValueChange={(unit) => updatePiece(index, 'dimensions', {
                    ...piece.dimensions,
                    unit
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">inches</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-700">Package Description</Label>
              <Textarea
                placeholder="Describe the contents of this package..."
                value={piece.description}
                onChange={(e) => updatePiece(index, 'description', e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
