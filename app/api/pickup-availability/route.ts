/**
 * Pickup Availability API Endpoint - GET /api/pickup-availability
 * Returns available pickup dates and time slots based on ZIP code
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  PickupAvailabilityRequestSchema, 
  PickupAvailabilityResponseSchema,
  validateUSZipCode 
} from '@/lib/api/schemas/pickup-schemas';
import { ResponseFormatter } from '@/lib/api/utils/response-formatter';
import { ApiError, ErrorCodes } from '@/lib/api/utils/api-error';
import { TraceLogger, generateRequestId } from '@/lib/api/utils/trace-logger';
import { createPickupAvailabilityGenerator } from '@/lib/scheduling/availability';
import { MCPContextType } from '@/lib/api/schemas/task-schemas';
import { ZodError } from 'zod';

/**
 * GET /api/pickup-availability
 * 
 * Retrieves available pickup dates and time slots for a given ZIP code
 * 
 * Features:
 * - ZIP code validation and service area determination
 * - Intelligent availability calculation based on geographic zone
 * - Business day calculation with holiday exclusions
 * - Multiple time slot options with capacity indicators
 * - Weekend and holiday premium service options
 * - Service restrictions and limitations by area
 * - Realistic availability simulation with demand patterns
 * - Response caching for performance optimization
 * 
 * Query Parameters:
 * - zip (required): US ZIP code in 12345 or 12345-6789 format
 * - weeks (optional): Number of weeks to show (1-4, default: 3)
 * - includeWeekends (optional): Include weekend pickup options (default: false)
 * - includeHolidays (optional): Include holiday pickup options (default: false)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     availableDates: AvailableDate[],
 *     restrictions: ServiceRestriction[],
 *     cutoffTime: string,
 *     serviceArea: { zone, coverage, description },
 *     weekendOptions?: PremiumOptions,
 *     holidayOptions?: PremiumOptions,
 *     metadata: { generatedAt, validUntil, minimumLeadTime, maxAdvanceBooking }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const requestId = generateRequestId();
  
  // Create MCP context for comprehensive logging
  const context: MCPContextType = {
    project: 'nextjs-postal-2025-07',
    taskId: 'task-3-4-pickup-availability-api',
    phase: 'phase-3',
    requestId,
    metadata: {
      timestamp: new Date().toISOString(),
      traceLevel: 'verbose' // Detailed logging for availability calculations
    }
  };
  
  const logger = new TraceLogger(context);
  const formatter = new ResponseFormatter(context);
  
  logger.log('info', 'pickup_availability_request_received', {
    method: 'GET',
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer')
  });
  
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = {
      zip: url.searchParams.get('zip'),
      numberOfWeeks: parseInt(url.searchParams.get('weeks') || '3'),
      includeWeekends: url.searchParams.get('includeWeekends') === 'true',
      includeHolidays: url.searchParams.get('includeHolidays') === 'true'
    };
    
    logger.log('debug', 'query_parameters_parsed', queryParams);
    
    // Validate required parameters
    if (!queryParams.zip) {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        'ZIP code parameter is required',
        { 
          parameter: 'zip',
          provided: queryParams.zip,
          required: true
        },
        400 // Bad Request for validation errors
      );
    }
    
    // Validate request data against schema
    let validatedRequest;
    try {
      validatedRequest = PickupAvailabilityRequestSchema.parse({
        zip: queryParams.zip,
        numberOfWeeks: queryParams.numberOfWeeks,
        includeWeekends: queryParams.includeWeekends,
        includeHolidays: queryParams.includeHolidays
      });
      
      logger.log('debug', 'request_validation_passed', {
        zip: validatedRequest.zip,
        numberOfWeeks: validatedRequest.numberOfWeeks,
        includeWeekends: validatedRequest.includeWeekends,
        includeHolidays: validatedRequest.includeHolidays
      });
    } catch (error) {
      if (error instanceof ZodError) {
        logger.log('warn', 'request_validation_failed', {
          validationErrors: error.issues,
          receivedData: queryParams
        });
        
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));
        
        throw new ApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Request parameter validation failed',
          { validationErrors },
          400 // Bad Request for validation errors
        );
      }
      throw error;
    }
    
    // Additional business rule validations
    const businessValidation = await validateBusinessRules(validatedRequest, logger);
    if (!businessValidation.isValid) {
      logger.log('warn', 'business_validation_failed', {
        errors: businessValidation.errors
      });
      
      throw new ApiError(
        ErrorCodes.BUSINESS_RULE_VIOLATION,
        'Business validation failed',
        { validationErrors: businessValidation.errors },
        400 // Bad Request for business rule violations
      );
    }
    
    // Create availability generator with caching optimization
    const availabilityGenerator = createPickupAvailabilityGenerator(logger);
    
    // Cache key for this request
    const cacheKey = `availability-${validatedRequest.zip}-${validatedRequest.numberOfWeeks}-${validatedRequest.includeWeekends}-${validatedRequest.includeHolidays}`;
    
    // Generate availability data with performance optimization
    const startGeneration = performance.now();
    const availabilityData = availabilityGenerator.generateAvailability(
      validatedRequest.zip,
      validatedRequest.numberOfWeeks,
      validatedRequest.includeWeekends,
      validatedRequest.includeHolidays
    );
    const generationTime = performance.now() - startGeneration;
    
    logger.log('info', 'availability_generated_successfully', {
      zip: validatedRequest.zip,
      serviceArea: availabilityData.serviceArea.zone,
      coverage: availabilityData.serviceArea.coverage,
      availableDatesCount: availabilityData.availableDates.length,
      restrictionsCount: availabilityData.restrictions.length,
      weekendOptionsAvailable: !!availabilityData.weekendOptions?.available,
      holidayOptionsAvailable: !!availabilityData.holidayOptions?.available,
      generationTimeMs: generationTime.toFixed(2)
    });
    
    // Log availability summary by time slot
    const timeSlotSummary = availabilityData.availableDates.reduce((summary, date) => {
      date.timeSlots.forEach(slot => {
        if (!summary[slot.id]) {
          summary[slot.id] = { available: 0, limited: 0, unavailable: 0 };
        }
        summary[slot.id][slot.availability]++;
      });
      return summary;
    }, {} as Record<string, Record<string, number>>);
    
    logger.log('debug', 'availability_summary_by_timeslot', { timeSlotSummary });
    
    // Validate response against schema
    const validatedResponse = PickupAvailabilityResponseSchema.parse(availabilityData);
    
    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    
    logger.log('info', 'pickup_availability_request_completed', {
      requestId,
      totalProcessingTime,
      availableDatesReturned: availabilityData.availableDates.length,
      responseSize: JSON.stringify(validatedResponse).length,
      cacheValidUntil: availabilityData.metadata.validUntil
    });
    
    // Add caching headers
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800', // 1 hour cache, 30 min stale
      'ETag': `"pickup-${validatedRequest.zip}-${availabilityData.metadata.generatedAt}"`,
      'Vary': 'zip, weeks, includeWeekends, includeHolidays'
    };
    
    return formatter.success(validatedResponse, { headers: cacheHeaders });
    
  } catch (error) {
    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    
    logger.log('error', 'pickup_availability_request_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: totalProcessingTime
    });
    
    if (error instanceof ApiError) {
      return formatter.error(error.code, error.message, error.details, error.statusCode);
    }
    
    // Handle unexpected errors
    const apiError = new ApiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Pickup availability calculation failed',
      { 
        originalError: error instanceof Error ? error.message : 'Unknown error',
        processingTime: totalProcessingTime
      }
    );
    
    return formatter.error(apiError.code, apiError.message, apiError.details, apiError.statusCode);
  }
}

/**
 * Validate business rules for pickup availability requests
 */
async function validateBusinessRules(
  request: any,
  logger: TraceLogger
): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string; code: string }> }> {
  const errors: Array<{ field: string; message: string; code: string }> = [];
  
  logger.log('debug', 'validating_business_rules', {
    zip: request.zip,
    numberOfWeeks: request.numberOfWeeks
  });
  
  // Validate ZIP code format specifically for US
  if (!validateUSZipCode(request.zip)) {
    errors.push({
      field: 'zip',
      message: 'ZIP code must be in valid US format (12345 or 12345-6789)',
      code: 'INVALID_ZIP_FORMAT'
    });
  }
  
  // Check for extremely remote areas that are unsupported
  const extremeRemoteZips = ['99950', '99951', '99952']; // Very remote Alaska
  if (extremeRemoteZips.includes(request.zip)) {
    errors.push({
      field: 'zip',
      message: 'This service area is not currently supported due to extreme remote location',
      code: 'UNSUPPORTED_SERVICE_AREA'
    });
  }
  
  // Validate number of weeks range
  if (request.numberOfWeeks < 1 || request.numberOfWeeks > 4) {
    errors.push({
      field: 'numberOfWeeks',
      message: 'Number of weeks must be between 1 and 4',
      code: 'INVALID_WEEKS_RANGE'
    });
  }
  
  // Validate premium service combinations
  if (request.includeHolidays && request.includeWeekends) {
    // Check if this might create overwhelming premium fees
    logger.log('info', 'premium_services_requested', {
      includeHolidays: request.includeHolidays,
      includeWeekends: request.includeWeekends,
      zip: request.zip
    });
  }
  
  logger.log('debug', 'business_rules_validation_completed', {
    isValid: errors.length === 0,
    errorCount: errors.length
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * OPTIONS handler for CORS support
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    }
  });
}
