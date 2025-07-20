/**
 * Quote API Endpoint - POST /api/quote
 * Calculates shipping quotes for all available carriers and services
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuoteRequestSchema, QuoteResponseSchema, validatePackageConstraints, validateZipCodeForCountry, validateStateForCountry } from '@/lib/api/schemas/quote-schemas';
import { ResponseFormatter } from '@/lib/api/utils/response-formatter';
import { ApiError, ErrorCodes } from '@/lib/api/utils/api-error';
import { TraceLogger, generateRequestId } from '@/lib/api/utils/trace-logger';
import { createPricingCalculator, simulateProcessingDelay } from '@/lib/pricing/calculator';
import { MCPContextType } from '@/lib/api/schemas/task-schemas';
import { ZodError } from 'zod';

/**
 * POST /api/quote
 * 
 * Calculates comprehensive shipping quotes across all available carriers
 * 
 * Features:
 * - Multi-carrier quote comparison
 * - Real-time pricing calculations
 * - Service category organization (ground/air/freight)
 * - Comprehensive cost breakdowns
 * - Carbon footprint calculations
 * - Transit time estimates
 * - Service feature comparisons
 * - Quote expiration tracking
 * 
 * Request Body:
 * {
 *   shipmentDetails: {
 *     origin: Address,
 *     destination: Address,
 *     package: PackageInfo,
 *     deliveryPreferences: DeliveryPreferences
 *   }
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     quotes: {
 *       ground: PricingOption[],
 *       air: PricingOption[],
 *       freight: PricingOption[]
 *     },
 *     requestId: string,
 *     expiresAt: ISO8601,
 *     calculatedAt: ISO8601
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const requestId = generateRequestId();
  
  // Create MCP context for comprehensive logging
  const context: MCPContextType = {
    project: 'nextjs-postal-2025-07',
    taskId: 'task-3-3-pricing-quote-api',
    phase: 'phase-3',
    requestId,
    metadata: {
      timestamp: new Date().toISOString(),
      traceLevel: 'verbose' // Detailed logging for pricing calculations
    }
  };
  
  const logger = new TraceLogger(context);
  const formatter = new ResponseFormatter(context);
  
  logger.log('info', 'quote_request_received', {
    method: 'POST',
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    contentType: request.headers.get('content-type')
  });
  
  try {
    // Parse and validate request body
    const requestBody = await request.json();
    logger.log('debug', 'request_body_parsed', { bodySize: JSON.stringify(requestBody).length });
    
    let validatedRequest;
    try {
      validatedRequest = QuoteRequestSchema.parse(requestBody);
      logger.log('debug', 'request_validation_passed', {
        originZip: validatedRequest.shipmentDetails.origin.zip,
        destinationZip: validatedRequest.shipmentDetails.destination.zip,
        packageType: validatedRequest.shipmentDetails.package.type,
        weight: validatedRequest.shipmentDetails.package.weight.value,
        weightUnit: validatedRequest.shipmentDetails.package.weight.unit
      });
    } catch (error) {
      if (error instanceof ZodError) {
        logger.log('warn', 'request_validation_failed', {
          validationErrors: error.issues,
          receivedData: requestBody
        });
        
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));
        
        throw new ApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Request validation failed',
          { validationErrors }
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
        { validationErrors: businessValidation.errors }
      );
    }
    
    // Simulate realistic processing delay
    await simulateProcessingDelay();
    
    // Calculate quotes using pricing engine
    const pricingCalculator = createPricingCalculator(logger);
    const calculationResult = await pricingCalculator.calculateQuotes({
      shipmentDetails: validatedRequest.shipmentDetails,
      requestId
    });
    
    logger.log('info', 'quotes_calculated_successfully', {
      totalQuotes: calculationResult.calculationMetrics.quotesGenerated,
      groundQuotes: calculationResult.quotes.ground.length,
      airQuotes: calculationResult.quotes.air.length,
      freightQuotes: calculationResult.quotes.freight.length,
      calculationTime: calculationResult.calculationMetrics.totalCalculationTime,
      distance: calculationResult.calculationMetrics.distance,
      zone: calculationResult.calculationMetrics.zone,
      billableWeight: calculationResult.calculationMetrics.billableWeight
    });
    
    // Log any warnings
    if (calculationResult.warnings.length > 0) {
      logger.log('warn', 'calculation_warnings', {
        warnings: calculationResult.warnings
      });
    }
    
    // Build response
    const calculatedAt = new Date();
    const expiresAt = new Date(calculatedAt.getTime() + (30 * 60 * 1000)); // 30 minutes expiration
    
    const responseData = {
      quotes: calculationResult.quotes,
      requestId,
      expiresAt: expiresAt.toISOString(),
      calculatedAt: calculatedAt.toISOString()
    };
    
    // Validate response against schema
    const validatedResponse = QuoteResponseSchema.parse(responseData);
    
    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    
    logger.log('info', 'quote_request_completed', {
      requestId,
      totalProcessingTime,
      quotesReturned: calculationResult.calculationMetrics.quotesGenerated,
      responseSize: JSON.stringify(validatedResponse).length
    });
    
    return formatter.success(validatedResponse);
    
  } catch (error) {
    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    
    logger.log('error', 'quote_request_failed', {
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
      'Quote calculation failed',
      { 
        originalError: error instanceof Error ? error.message : 'Unknown error',
        processingTime: totalProcessingTime
      }
    );
    
    return formatter.error(apiError.code, apiError.message, apiError.details, apiError.statusCode);
  }
}

/**
 * Validate business rules for quote requests
 */
async function validateBusinessRules(
  request: any,
  logger: TraceLogger
): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string; code: string }> }> {
  const errors: Array<{ field: string; message: string; code: string }> = [];
  
  logger.log('debug', 'validating_business_rules', {
    originCountry: request.shipmentDetails.origin.country,
    destinationCountry: request.shipmentDetails.destination.country
  });
  
  // Validate ZIP codes for their respective countries
  const originZipValid = validateZipCodeForCountry(
    request.shipmentDetails.origin.zip,
    request.shipmentDetails.origin.country
  );
  
  if (!originZipValid) {
    errors.push({
      field: 'shipmentDetails.origin.zip',
      message: `Invalid ZIP code format for ${request.shipmentDetails.origin.country}`,
      code: 'INVALID_ZIP_FORMAT'
    });
  }
  
  const destinationZipValid = validateZipCodeForCountry(
    request.shipmentDetails.destination.zip,
    request.shipmentDetails.destination.country
  );
  
  if (!destinationZipValid) {
    errors.push({
      field: 'shipmentDetails.destination.zip',
      message: `Invalid ZIP code format for ${request.shipmentDetails.destination.country}`,
      code: 'INVALID_ZIP_FORMAT'
    });
  }
  
  // Validate state codes for their respective countries
  const originStateValid = validateStateForCountry(
    request.shipmentDetails.origin.state,
    request.shipmentDetails.origin.country
  );
  
  if (!originStateValid) {
    errors.push({
      field: 'shipmentDetails.origin.state',
      message: `Invalid state code for ${request.shipmentDetails.origin.country}`,
      code: 'INVALID_STATE_CODE'
    });
  }
  
  const destinationStateValid = validateStateForCountry(
    request.shipmentDetails.destination.state,
    request.shipmentDetails.destination.country
  );
  
  if (!destinationStateValid) {
    errors.push({
      field: 'shipmentDetails.destination.state',
      message: `Invalid state code for ${request.shipmentDetails.destination.country}`,
      code: 'INVALID_STATE_CODE'
    });
  }
  
  // Validate package constraints
  const packageValidation = validatePackageConstraints(request.shipmentDetails.package);
  if (!packageValidation.isValid) {
    for (const error of packageValidation.errors) {
      errors.push({
        field: 'shipmentDetails.package',
        message: error,
        code: 'PACKAGE_CONSTRAINT_VIOLATION'
      });
    }
  }
  
  // Validate special handling combinations
  const specialHandling = request.shipmentDetails.package.specialHandling;
  if (specialHandling.includes('hazmat') && specialHandling.includes('temperature-controlled')) {
    errors.push({
      field: 'shipmentDetails.package.specialHandling',
      message: 'Hazardous materials cannot be combined with temperature-controlled shipping',
      code: 'INCOMPATIBLE_SPECIAL_HANDLING'
    });
  }
  
  // Validate international shipping constraints
  const isInternational = request.shipmentDetails.origin.country !== request.shipmentDetails.destination.country;
  if (isInternational) {
    if (specialHandling.includes('hazmat')) {
      errors.push({
        field: 'shipmentDetails.package.specialHandling',
        message: 'Hazardous materials not available for international shipping',
        code: 'INTERNATIONAL_RESTRICTION'
      });
    }
    
    if (request.shipmentDetails.package.declaredValue > 25000) {
      errors.push({
        field: 'shipmentDetails.package.declaredValue',
        message: 'Declared value cannot exceed $25,000 for international shipping',
        code: 'INTERNATIONAL_VALUE_LIMIT'
      });
    }
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
