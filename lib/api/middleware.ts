import { NextRequest, NextResponse } from 'next/server';

/**
 * API middleware wrapper for consistent error handling and logging
 */
export function withApiHandler(handler: () => Promise<NextResponse>) {
  return async function handlerWrapper(): Promise<NextResponse> {
    try {
      console.log('🔄 [API-MIDDLEWARE] Processing request...');
      const result = await handler();
      console.log('✅ [API-MIDDLEWARE] Request processed successfully');
      return result;
    } catch (error: any) {
      console.error('💥 [API-MIDDLEWARE] Request failed:', {
        error: error.message,
        stack: error.stack
      });
      
      return NextResponse.json(
        {
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
  };
}