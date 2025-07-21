import type {
  FormConfig,
  QuoteRequest,
  QuoteResponse,
  PickupAvailability,
  SubmissionResponse,
  ShippingTransaction,
  ApiError
} from '@/lib/types';

export interface ApiClientError extends ApiError {
  statusCode?: number;
  response?: any;
}

export class ApiClientError extends Error implements ApiClientError {
  constructor(
    public message: string,
    public code: string,
    public statusCode?: number,
    public details?: any,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Basic API client for all shipping API endpoints
 * Provides type-safe interface with consistent error handling
 */
export class ApiClient {
  private static readonly BASE_URL = '/api';
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  /**
   * Base request method with common error handling and timeout management
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    console.log(`🌐 [API-CLIENT] Making request to ${endpoint}`);
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ [API-CLIENT] Request timeout after ${timeout}ms: ${endpoint}`);
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      const requestTime = Date.now() - startTime;
      console.log(`📡 [API-CLIENT] Response received in ${requestTime}ms: ${endpoint} (${response.status})`);

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        console.error(`❌ [API-CLIENT] API error ${response.status}:`, errorData);
        
        throw new ApiClientError(
          errorData.message || `Request failed with status ${response.status}`,
          errorData.error || 'API_ERROR',
          response.status,
          errorData.details,
          errorData
        );
      }

      const data = await response.json();
      console.log(`✅ [API-CLIENT] Request successful: ${endpoint}`);
      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);
      const requestTime = Date.now() - startTime;

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`⏰ [API-CLIENT] Request timed out after ${requestTime}ms: ${endpoint}`);
        throw new ApiClientError(
          `Request timed out after ${timeout / 1000} seconds`,
          'TIMEOUT_ERROR',
          408
        );
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`🌐 [API-CLIENT] Network error: ${endpoint}`, error);
        throw new ApiClientError(
          'Unable to connect to server. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }

      console.error(`💥 [API-CLIENT] Unexpected error: ${endpoint}`, error);
      throw new ApiClientError(
        'An unexpected error occurred. Please try again.',
        'UNKNOWN_ERROR',
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Get form configuration data
   */
  static async getFormConfig(): Promise<FormConfig> {
    console.log('📋 [API-CLIENT] Fetching form configuration...');
    
    try {
      const response = await this.request<{data: FormConfig}>('/form-config', {
        method: 'GET',
      });
      
      const config = response.data;
      
      console.log('📋 [API-CLIENT] Form config loaded:', {
        packageTypes: config.packageTypes?.length,
        countries: config.countries?.length,
        industries: config.industries?.length
      });
      
      return config;
    } catch (error) {
      console.error('💥 [API-CLIENT] Failed to fetch form config:', error);
      throw error;
    }
  }

  /**
   * Request shipping quotes
   */
  static async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    console.log('💰 [API-CLIENT] Requesting shipping quotes...', {
      origin: `${request.shipmentDetails.origin.city}, ${request.shipmentDetails.origin.state}`,
      destination: `${request.shipmentDetails.destination.city}, ${request.shipmentDetails.destination.state}`,
      packageType: request.shipmentDetails.package.type,
      weight: `${request.shipmentDetails.package.weight.value} ${request.shipmentDetails.package.weight.unit}`
    });

    try {
      const response = await this.request<{data: QuoteResponse}>('/quote', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      const quoteData = response.data;
      const totalQuotes = (quoteData.quotes.ground?.length || 0) + 
                         (quoteData.quotes.air?.length || 0) + 
                         (quoteData.quotes.freight?.length || 0);

      console.log('💰 [API-CLIENT] Quotes received:', {
        requestId: quoteData.requestId,
        totalQuotes,
        ground: quoteData.quotes.ground?.length || 0,
        air: quoteData.quotes.air?.length || 0,
        freight: quoteData.quotes.freight?.length || 0,
        expiresAt: quoteData.expiresAt
      });

      return quoteData;
    } catch (error) {
      console.error('💥 [API-CLIENT] Failed to get quotes:', error);
      throw error;
    }
  }

  /**
   * Get pickup availability for a ZIP code
   */
  static async getPickupAvailability(zipCode: string): Promise<PickupAvailability> {
    console.log('📅 [API-CLIENT] Fetching pickup availability...', { zipCode });

    if (!zipCode || zipCode.length < 5) {
      throw new ApiClientError(
        'Valid ZIP code is required',
        'INVALID_ZIP_CODE',
        400
      );
    }

    try {
      const response = await this.request<{data: PickupAvailability}>(
        `/pickup-availability?zip=${encodeURIComponent(zipCode)}`,
        {
          method: 'GET',
        }
      );

      const pickupData = response.data;

      console.log('📅 [API-CLIENT] Pickup availability received:', {
        zipCode,
        availableDates: pickupData.availableDates?.length || 0,
        cutoffTime: pickupData.cutoffTime,
        restrictions: pickupData.restrictions?.length || 0
      });

      return pickupData;
    } catch (error) {
      console.error('💥 [API-CLIENT] Failed to get pickup availability:', error);
      throw error;
    }
  }

  /**
   * Submit complete shipping transaction
   */
  static async submitShipment(transaction: ShippingTransaction): Promise<SubmissionResponse> {
    console.log('🚀 [API-CLIENT] Submitting shipment...', {
      transactionId: transaction.id,
      status: transaction.status,
      carrier: transaction.selectedOption?.carrier,
      paymentMethod: transaction.paymentInfo?.method,
      pickupDate: transaction.pickupDetails?.date
    });

    try {
      const response = await this.request<SubmissionResponse>('/submit-shipment', {
        method: 'POST',
        body: JSON.stringify({ transaction }),
      }, 45000); // Extended timeout for submission processing

      console.log('🚀 [API-CLIENT] Shipment submitted successfully:', {
        confirmationNumber: response.confirmationNumber,
        trackingNumber: response.trackingNumber,
        estimatedDelivery: response.estimatedDelivery,
        carrier: response.carrierInfo?.name,
        totalCost: response.totalCost
      });

      return response;
    } catch (error) {
      console.error('💥 [API-CLIENT] Failed to submit shipment:', error);
      throw error;
    }
  }

  /**
   * Utility method to check if an error is an ApiClientError
   */
  static isApiClientError(error: any): error is ApiClientError {
    return error instanceof ApiClientError;
  }

  /**
   * Utility method to get user-friendly error message
   */
  static getUserFriendlyErrorMessage(error: any): string {
    if (this.isApiClientError(error)) {
      switch (error.code) {
        case 'TIMEOUT_ERROR':
          return 'The request is taking longer than expected. Please try again.';
        case 'NETWORK_ERROR':
          return 'Unable to connect to the server. Please check your internet connection and try again.';
        case 'VALIDATION_ERROR':
          return 'Please check your information and try again.';
        case 'PAYMENT_DECLINED':
          return 'Payment authorization failed. Please verify your payment information and try again.';
        case 'PICKUP_UNAVAILABLE':
          return 'The selected pickup time is no longer available. Please choose a different time.';
        case 'QUOTE_EXPIRED':
          return 'Your pricing quote has expired. Please request new quotes.';
        default:
          return error.message || 'An error occurred. Please try again.';
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Utility method to check API health
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    console.log('🔍 [API-CLIENT] Performing health check...');
    
    try {
      // Use form config endpoint as health check since it's lightweight
      await this.getFormConfig();
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ [API-CLIENT] Health check passed:', healthData);
      return healthData;
    } catch (error) {
      console.error('❌ [API-CLIENT] Health check failed:', error);
      throw new ApiClientError(
        'API health check failed',
        'HEALTH_CHECK_FAILED',
        503,
        error
      );
    }
  }
}