'use client';

import { PackageInfo } from '@/lib/types';
import { Box, Package, Truck, Container, Archive, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageTypeSelectorProps {
  value: PackageInfo['type'];
  onChange: (type: PackageInfo['type']) => void;
  className?: string;
  error?: string;
}

const packageTypes = [
  {
    value: 'envelope' as const,
    label: 'Envelope',
    description: 'Documents, certificates',
    maxWeight: 1,
    icon: Archive,
    dimensions: 'Up to 15" x 12" x 1"',
    examples: 'Legal documents, contracts, photographs'
  },
  {
    value: 'small' as const,
    label: 'Small Box',
    description: 'Small items, electronics',
    maxWeight: 50,
    icon: Box,
    dimensions: 'Up to 20" x 20" x 12"',
    examples: 'Books, small electronics, samples'
  },
  {
    value: 'medium' as const,
    label: 'Medium Box',
    description: 'Standard packages',
    maxWeight: 150,
    icon: Package,
    dimensions: 'Up to 36" x 24" x 18"',
    examples: 'Clothing, tools, computer equipment'
  },
  {
    value: 'large' as const,
    label: 'Large Box',
    description: 'Bulky items',
    maxWeight: 500,
    icon: Container,
    dimensions: 'Up to 48" x 36" x 24"',
    examples: 'Appliances, furniture components, machinery parts'
  },
  {
    value: 'pallet' as const,
    label: 'Pallet',
    description: 'Freight shipments',
    maxWeight: 2500,
    icon: Layers,
    dimensions: 'Up to 48" x 40" x 84"',
    examples: 'Industrial equipment, bulk goods, stacked boxes'
  },
  {
    value: 'crate' as const,
    label: 'Crate',
    description: 'Heavy freight',
    maxWeight: 5000,
    icon: Truck,
    dimensions: 'Custom dimensions',
    examples: 'Heavy machinery, vehicles, oversized equipment'
  }
];

export function PackageTypeSelector({ value, onChange, className, error }: PackageTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packageTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'flex-shrink-0 p-2 rounded-lg',
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'font-medium text-sm',
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  )}>
                    {type.label}
                  </h3>
                  <p className={cn(
                    'text-xs mt-1',
                    isSelected ? 'text-blue-700' : 'text-gray-500'
                  )}>
                    {type.description}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className={cn(
                      'text-xs font-medium',
                      isSelected ? 'text-blue-800' : 'text-gray-700'
                    )}>
                      Max: {type.maxWeight} lbs
                    </div>
                    <div className={cn(
                      'text-xs',
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    )}>
                      {type.dimensions}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Expandable examples section */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className={cn(
                  'text-xs',
                  isSelected ? 'text-blue-600' : 'text-gray-500'
                )}>
                  <span className="font-medium">Examples: </span>
                  {type.examples}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}