import { NextRequest } from 'next/server';
import { FormConfigRequestSchema, FormConfig } from '@/lib/api/schemas/form-config-schemas';
import { ResponseFormatter } from '@/lib/api/utils/response-formatter';
import { ApiError, ErrorCodes } from '@/lib/api/utils/api-error';
import { TraceLogger, generateRequestId } from '@/lib/api/utils/trace-logger';
import { globalCache, CacheManager, globalDeduplicator } from '@/lib/api/utils/cache-manager';
import { formConfigData } from '@/lib/api/data/form-config-data';
import { z } from 'zod';
import { MCPContextType } from '@/lib/api/schemas/task-schemas';

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = '1.0.0';

/**
 * GET /api/form-config
 * 
 * Returns comprehensive form configuration data including:
 * - Package types with weight/dimension limits
 * - Geographic data for North American markets
 * - Special handling options with pricing
 * - Validation rules for all form fields
 * - Industry classifications
 * - Payment methods and currencies
 * 
 * Features:
 * - Aggressive caching with ETag support
 * - Request deduplication
 * - Gzip compression
 * - Conditional requests (If-None-Match)
 * - Performance monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const requestId = generateRequestId();
  
  // Create MCP context for response formatting
  const context: MCPContextType = {
    project: 'nextjs-postal-2025-07',
    taskId: 'task-3-2-form-config-api',
    phase: 'phase-3',
    requestId,
    metadata: {
      timestamp: new Date().toISOString(),
      traceLevel: 'standard'
    }
  };

  const logger = new TraceLogger(context);
  const formatter = new ResponseFormatter(context);

  try {
    logger.log('info', 'Form configuration request started', { 
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      cacheStats: globalCache.getStats()
    });

    // Parse query parameters
    const url = new URL(request.url);
    const requestData = {
      sections: url.searchParams.get('sections')?.split(',') || undefined,
      locale: url.searchParams.get('locale') || 'en-US',
      version: url.searchParams.get('version') || undefined
    };

    // Validate request parameters
    let validatedRequest;
    try {
      validatedRequest = FormConfigRequestSchema.parse(requestData);
      logger.log('info', 'Request validation successful', { validatedRequest });
    } catch (validationError) {
      logger.log('error', 'Request validation failed', { validationError, requestData });
      if (validationError instanceof z.ZodError) {
        throw new ApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid request parameters',
          {
            errors: validationError.issues,
            received: requestData
          },
          400,
          requestId
        );
      }
      throw validationError;
    }

    // Generate cache key including sections for proper separation
    const sectionsKey = validatedRequest.sections ? validatedRequest.sections.sort().join(',') : 'all';
    const cacheKey = `${CacheManager.getFormConfigKey(
      validatedRequest.locale,
      validatedRequest.version || CACHE_VERSION
    )}:sections:${sectionsKey}`;

    // Check for conditional request (If-None-Match)
    const clientETag = request.headers.get('if-none-match');
    if (clientETag && !globalCache.hasChanged(cacheKey, clientETag)) {
      logger.log('info', 'Conditional request - no changes detected', { 
        cacheKey, 
        clientETag,
        processingTime: performance.now() - startTime
      });
      
      return new Response(null, {
        status: 304,
        headers: {
          'X-Request-ID': requestId,
          'X-Cache': 'HIT',
          'X-Processing-Time': `${Math.round(performance.now() - startTime)}ms`,
          'Cache-Control': 'public, max-age=86400, must-revalidate',
          'ETag': clientETag
        }
      });
    }

    // Try to get from cache first
    const cachedResult = globalCache.get<FormConfig>(cacheKey);
    if (cachedResult) {
      logger.log('info', 'Cache hit - returning cached data', { 
        cacheKey,
        etag: cachedResult.etag,
        processingTime: performance.now() - startTime
      });

      return formatter.success(cachedResult.data, {
        headers: {
          'ETag': cachedResult.etag,
          'Cache-Control': 'public, max-age=86400, must-revalidate',
          'X-Cache': 'HIT',
          'X-Processing-Time': `${Math.round(performance.now() - startTime)}ms`
        },
        version: CACHE_VERSION
      });
    }

    // Cache miss - use request deduplication to prevent concurrent processing
    const configData = await globalDeduplicator.deduplicate(
      cacheKey,
      async () => {
        logger.log('info', 'Cache miss - generating fresh configuration data', { cacheKey });
        
        // Start data assembly timer
        const assemblyStart = performance.now();
        
        try {
          // Quick validation (minimal overhead)
          if (!formConfigData.packageTypes?.length || !formConfigData.countries?.length || !formConfigData.validation?.length) {
            throw new ApiError(
              ErrorCodes.INTERNAL_SERVER_ERROR,
              'Form configuration data is incomplete',
              { hasPackageTypes: !!formConfigData.packageTypes?.length, hasCountries: !!formConfigData.countries?.length, hasValidation: !!formConfigData.validation?.length },
              500,
              requestId
            );
          }

          // Apply any request-specific filtering
          let responseData = { ...formConfigData };

          // Filter by sections if requested
          if (validatedRequest.sections && validatedRequest.sections.length > 0) {
            const filteredData: Partial<FormConfig> = {
              metadata: responseData.metadata
            };
            
            for (const section of validatedRequest.sections) {
              if (section in responseData) {
                (filteredData as any)[section] = (responseData as any)[section];
              }
            }
            
            responseData = filteredData as FormConfig;
            logger.log('info', 'Applied section filtering', { 
              requestedSections: validatedRequest.sections,
              includedSections: Object.keys(filteredData).filter(k => k !== 'metadata')
            });
          }

          // Update metadata with request-specific information
          const updatedMetadata = {
            ...responseData.metadata,
            version: validatedRequest.version || CACHE_VERSION,
            lastUpdated: new Date().toISOString()
          };
          
          responseData = {
            ...responseData,
            metadata: updatedMetadata
          };

          const assemblyTime = Math.round(performance.now() - assemblyStart);
          
          return responseData;

        } catch (error) {
          throw error;
        }
      }
    );

    // Store in cache with compression flag
    globalCache.set(cacheKey, configData, CACHE_TTL, true);
    
    // Get ETag for the response
    const finalCached = globalCache.get<FormConfig>(cacheKey);
    const etag = finalCached?.etag || '"fallback"';

    // Build response
    const processingTime = Math.round(performance.now() - startTime);

    logger.log('info', 'Form configuration request completed', {
      processingTime,
      cacheKey,
      etag,
      sections: Object.keys(configData).filter(k => k !== 'metadata').length
    });

    return formatter.success(configData, {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=86400, must-revalidate',
        'X-Cache': 'MISS',
        'X-Processing-Time': `${processingTime}ms`
      },
      version: CACHE_VERSION
    });

  } catch (error) {
    const processingTime = Math.round(performance.now() - startTime);
    
    logger.log('error', 'Form configuration request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime
    });

    if (ApiError.isApiError(error)) {
      return formatter.error(
        error.code,
        error.message,
        error.details,
        error.statusCode,
        {
          'X-Processing-Time': `${processingTime}ms`,
          'X-Cache': 'ERROR'
        }
      );
    }

    // Fallback for unexpected errors
    return formatter.error(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred while loading form configuration',
      {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      },
      500,
      {
        'X-Processing-Time': `${processingTime}ms`,
        'X-Cache': 'ERROR'
      }
    );
  }
}

/**
 * OPTIONS /api/form-config
 * 
 * CORS preflight support
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
      'Access-Control-Max-Age': '86400'
    }
  });
}
