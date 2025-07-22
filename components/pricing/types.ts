/**
 * Core types for pricing display components
 * Implements comprehensive TypeScript interfaces for pricing system
 */

import { PricingOption, ShipmentDetails } from '@/lib/types';

export interface PricingGridProps {
  readonly quotes: PricingOption[] | null;
  readonly selectedQuote: PricingOption | null;
  readonly onSelectQuote: (quote: PricingOption) => void;
  readonly loading: boolean;
  readonly error: ApiClientError | null;
  readonly groupBy: 'category' | 'price' | 'speed';
  readonly sortBy: 'price' | 'speed' | 'rating';
  readonly filters: PricingFiltersData;
  readonly onFiltersChange: (filters: PricingFiltersData) => void;
}

export interface PricingCategoryProps {
  readonly category: ServiceCategory;
  readonly quotes: PricingOption[];
  readonly selectedQuote: PricingOption | null;
  readonly onSelectQuote: (quote: PricingOption) => void;
  readonly loading: boolean;
  readonly sortBy: SortField;
  readonly filters: CategoryFilters;
}

export interface PricingCardProps {
  readonly quote: PricingOption;
  readonly selected: boolean;
  readonly onSelect: (quote: PricingOption) => void;
  readonly showBreakdown: boolean;
  readonly comparisonMode: boolean;
  readonly highlightFeatures: readonly string[];
  readonly disabled?: boolean;
  readonly variant: 'default' | 'featured' | 'compact';
  // Comparison functionality
  readonly inComparison?: boolean;
  readonly onAddToComparison?: (quote: PricingOption) => void;
  readonly onRemoveFromComparison?: (quote: PricingOption) => void;
  readonly comparisonDisabled?: boolean;
}

export interface PricingBreakdownProps {
  readonly breakdown: PricingOption['pricing'];
  readonly expanded: boolean;
  readonly onToggleExpanded: () => void;
  readonly showCalculationBasis: boolean;
  readonly currencyFormat: CurrencyDisplayOptions;
}

export interface ServiceCategory {
  readonly id: 'ground' | 'air' | 'freight';
  readonly name: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly defaultSort: SortField;
}

export interface PricingFiltersData {
  readonly maxPrice?: number;
  readonly maxTransitDays?: number;
  readonly carriers?: readonly string[];
  readonly features?: readonly string[];
  readonly excludeHazmat?: boolean;
}

export interface CategoryFilters extends PricingFiltersData {
  readonly category: 'ground' | 'air' | 'freight';
}

export interface CurrencyDisplayOptions {
  readonly currency: 'USD' | 'CAD' | 'EUR';
  readonly locale: string;
  readonly precision: number;
  readonly showSymbol: boolean;
}

export type SortField = 'price' | 'speed' | 'rating' | 'carbon';
export type CardVariant = 'default' | 'featured' | 'compact';

export interface ApiClientError {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly retryable: boolean;
  readonly context?: Record<string, unknown>;
}

export interface UsePricingQuotesReturn {
  readonly quotes: PricingOption[] | null;
  readonly loading: boolean;
  readonly error: ApiClientError | null;
  readonly requestQuote: (details: ShipmentDetails) => Promise<void>;
  readonly refreshQuotes: () => Promise<void>;
  readonly quotesExpiry: Date | null;
  readonly isExpired: boolean;
}

export interface UsePricingSelectionReturn {
  readonly selectedQuote: PricingOption | null;
  readonly selectQuote: (quote: PricingOption) => void;
  readonly clearSelection: () => void;
  readonly canProceed: boolean;
  readonly selectionValidation: ValidationResult<PricingOption>;
}

export interface ValidationResult<T> {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly data?: T;
}

export interface QuoteLoadResult {
  readonly success: boolean;
  readonly quotes: PricingOption[];
  readonly expiresAt: Date;
  readonly requestId: string;
  readonly errors: ApiClientError[];
}

export interface RefreshResult {
  readonly success: boolean;
  readonly updatedQuotes: PricingOption[];
  readonly errors: ApiClientError[];
}

// Task 5.2 - New component types
export interface SelectedOptionSummaryProps {
  readonly selectedOption: PricingOption | null;
  readonly onChangeSelection: () => void;
  readonly onCompareWithOthers: () => void;
  readonly onProceedToPayment: () => void;
  readonly canProceed: boolean;
  readonly comparisonCount?: number;
}

export interface PricingComparisonProps {
  readonly options: PricingOption[];
  readonly selectedOption: PricingOption | null;
  readonly onSelectOption: (option: PricingOption) => void;
  readonly onRemoveOption: (option: PricingOption) => void;
  readonly maxOptions?: number;
  readonly showFeatureMatrix?: boolean;
}

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

export type SortOption = 'price-asc' | 'price-desc' | 'speed-asc' | 'speed-desc' | 'rating-desc' | 'carbon-asc';

export interface PricingSortingProps {
  readonly sortBy: SortOption;
  readonly onSortChange: (sortBy: SortOption) => void;
  readonly resultCount: number;
  readonly isCompact?: boolean;
}

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
