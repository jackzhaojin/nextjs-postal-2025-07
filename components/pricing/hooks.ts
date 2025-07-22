/**
 * Pricing Hooks - Data Management and State Hooks for Pricing Components
 * Implements comprehensive quote management and selection logic
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PricingOption, ShipmentDetails } from '@/lib/types';
import { 
  UsePricingQuotesReturn, 
  UsePricingSelectionReturn, 
  ApiClientError, 
  ValidationResult, 
  QuoteLoadResult 
} from './types';

/**
 * Hook for managing pricing quotes with API integration
 * Handles quote fetching, caching, expiration, and error management
 */
export function usePricingQuotes(shipmentDetails: ShipmentDetails | null): UsePricingQuotesReturn {
  const [quotes, setQuotes] = useState<PricingOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [quotesExpiry, setQuotesExpiry] = useState<Date | null>(null);
  const [lastRequestHash, setLastRequestHash] = useState<string | null>(null);

  console.log('[usePricingQuotes] Hook initialized', { 
    shipmentDetails: shipmentDetails ? 'present' : 'null',
    quotesCount: quotes?.length 
  });

  // Calculate if quotes are expired
  const isExpired = useMemo(() => {
    if (!quotesExpiry) return false;
    const now = new Date();
    const expired = now.getTime() > quotesExpiry.getTime();
    console.log('[usePricingQuotes] Expiry check', { 
      now: now.toISOString(), 
      expiry: quotesExpiry.toISOString(), 
      expired 
    });
    return expired;
  }, [quotesExpiry]);

  // Generate hash for shipment details to detect changes
  const generateRequestHash = useCallback((details: ShipmentDetails): string => {
    const hashData = {
      origin: `${details.origin.address}-${details.origin.city}-${details.origin.state}-${details.origin.zip}`,
      destination: `${details.destination.address}-${details.destination.city}-${details.destination.state}-${details.destination.zip}`,
      package: `${details.package.type}-${details.package.weight.value}-${details.package.weight.unit}`,
      value: details.package.declaredValue
    };
    return btoa(JSON.stringify(hashData));
  }, []);

  // Request quotes from API
  const requestQuote = useCallback(async (details: ShipmentDetails): Promise<void> => {
    console.log('[usePricingQuotes] Requesting quotes', { details });
    
    if (!details) {
      console.error('[usePricingQuotes] No shipment details provided');
      setError({
        code: 'MISSING_DETAILS',
        message: 'Shipment details are required to get quotes',
        statusCode: 400,
        retryable: false
      });
      return;
    }

    const requestHash = generateRequestHash(details);
    
    // Skip if same request and quotes not expired
    if (requestHash === lastRequestHash && quotes && !isExpired) {
      console.log('[usePricingQuotes] Using cached quotes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[usePricingQuotes] Making API call to /api/quote');
      
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipmentDetails: details
        }),
      });

      console.log('[usePricingQuotes] API response status', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}` 
        }));
        
        // Classify errors for retry logic
        const isRetryable = response.status < 500; // Don't retry 5xx server errors
        
        const apiError: ApiClientError = {
          code: response.status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR',
          message: errorData.message || `Request failed with status ${response.status}`,
          statusCode: response.status,
          retryable: isRetryable,
          context: { errorData }
        };
        
        setError(apiError);
        setQuotes(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[usePricingQuotes] API response data', { 
        success: data.success,
        quotesCount: data.data?.quotes?.length || 0 
      });

      if (!data.success) {
        throw new Error(data.message || 'Quote request failed');
      }

      // Process quotes from categorized response
      const allQuotes: PricingOption[] = [];
      
      if (data.data?.quotes) {
        if (data.data.quotes.ground) allQuotes.push(...data.data.quotes.ground);
        if (data.data.quotes.air) allQuotes.push(...data.data.quotes.air);
        if (data.data.quotes.freight) allQuotes.push(...data.data.quotes.freight);
      }

      console.log('[usePricingQuotes] Processed quotes', { totalCount: allQuotes.length });

      setQuotes(allQuotes);
      setLastRequestHash(requestHash);
      
      // Set expiration to 30 minutes from now
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 30);
      setQuotesExpiry(expiry);
      
      console.log('[usePricingQuotes] Quotes cached with expiry', expiry.toISOString());

    } catch (err) {
      console.error('[usePricingQuotes] Quote request failed', err);
      
      const error: ApiClientError = {
        code: 'QUOTE_REQUEST_FAILED',
        message: err instanceof Error ? err.message : 'Failed to fetch quotes',
        statusCode: 500,
        retryable: false // Network errors are not retryable automatically
      };
      
      setError(error);
      setQuotes(null);
    } finally {
      setLoading(false);
    }
  }, [generateRequestHash, lastRequestHash, quotes, isExpired]);

  // Refresh quotes
  const refreshQuotes = useCallback(async (): Promise<void> => {
    console.log('[usePricingQuotes] Refreshing quotes');
    
    if (!shipmentDetails) {
      console.warn('[usePricingQuotes] Cannot refresh - no shipment details');
      return;
    }

    // Clear cache to force new request
    setLastRequestHash(null);
    setQuotesExpiry(null);
    await requestQuote(shipmentDetails);
  }, [shipmentDetails, requestQuote]);

  // Auto-fetch quotes when shipment details change (with error backoff)
  useEffect(() => {
    if (shipmentDetails && !loading) {
      // Don't auto-retry if there's a non-retryable error or 5xx server error
      if (error && (!error.retryable || error.statusCode >= 500)) {
        console.log('[usePricingQuotes] Skipping auto-fetch due to server error', error);
        return;
      }
      
      console.log('[usePricingQuotes] Auto-fetching quotes for shipment details change');
      requestQuote(shipmentDetails);
    }
  }, [shipmentDetails, requestQuote, loading, error]);

  return {
    quotes,
    loading,
    error,
    requestQuote,
    refreshQuotes,
    quotesExpiry,
    isExpired
  };
}

/**
 * Hook for managing pricing option selection
 * Handles selection state and validation logic
 */
export function usePricingSelection(): UsePricingSelectionReturn {
  const [selectedQuote, setSelectedQuote] = useState<PricingOption | null>(null);

  console.log('[usePricingSelection] Hook initialized', { 
    hasSelection: !!selectedQuote,
    selectedId: selectedQuote?.id 
  });

  // Load selected quote from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentShippingTransaction');
      if (stored) {
        const transaction = JSON.parse(stored);
        if (transaction.selectedOption) {
          console.log('[usePricingSelection] Restored selection from localStorage', {
            id: transaction.selectedOption.id,
            serviceType: transaction.selectedOption.serviceType
          });
          setSelectedQuote(transaction.selectedOption);
        }
      }
    } catch (error) {
      console.error('[usePricingSelection] Failed to load selection from localStorage', error);
    }
  }, []);

  // Select quote and persist to localStorage
  const selectQuote = useCallback((quote: PricingOption): void => {
    console.log('[usePricingSelection] Selecting quote', { 
      id: quote.id,
      serviceType: quote.serviceType,
      category: quote.category,
      total: quote.pricing.total
    });

    setSelectedQuote(quote);

    // Persist to localStorage
    try {
      const stored = localStorage.getItem('currentShippingTransaction');
      let transaction = stored ? JSON.parse(stored) : {};
      
      transaction.selectedOption = quote;
      transaction.status = 'pricing';
      
      localStorage.setItem('currentShippingTransaction', JSON.stringify(transaction));
      console.log('[usePricingSelection] Selection persisted to localStorage');
      
    } catch (error) {
      console.error('[usePricingSelection] Failed to persist selection', error);
    }
  }, []);

  // Clear selection
  const clearSelection = useCallback((): void => {
    console.log('[usePricingSelection] Clearing selection');
    
    setSelectedQuote(null);

    // Clear from localStorage
    try {
      const stored = localStorage.getItem('currentShippingTransaction');
      if (stored) {
        const transaction = JSON.parse(stored);
        delete transaction.selectedOption;
        localStorage.setItem('currentShippingTransaction', JSON.stringify(transaction));
        console.log('[usePricingSelection] Selection cleared from localStorage');
      }
    } catch (error) {
      console.error('[usePricingSelection] Failed to clear selection from localStorage', error);
    }
  }, []);

  // Validate selection
  const selectionValidation = useMemo((): ValidationResult<PricingOption> => {
    if (!selectedQuote) {
      return {
        valid: false,
        errors: ['Please select a shipping option to continue'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for valid pricing
    if (!selectedQuote.pricing || selectedQuote.pricing.total <= 0) {
      errors.push('Selected option has invalid pricing');
    }

    // Check for valid transit time
    if (!selectedQuote.transitDays || selectedQuote.transitDays <= 0) {
      warnings.push('Transit time information may be incomplete');
    }

    const validation = {
      valid: errors.length === 0,
      errors,
      warnings,
      data: selectedQuote
    };

    console.log('[usePricingSelection] Validation result', validation);
    return validation;
  }, [selectedQuote]);

  // Check if user can proceed
  const canProceed = useMemo(() => {
    const result = selectionValidation.valid && !!selectedQuote;
    console.log('[usePricingSelection] Can proceed check', { 
      canProceed: result,
      hasSelection: !!selectedQuote,
      validationValid: selectionValidation.valid 
    });
    return result;
  }, [selectionValidation.valid, selectedQuote]);

  return {
    selectedQuote,
    selectQuote,
    clearSelection,
    canProceed,
    selectionValidation
  };
}
