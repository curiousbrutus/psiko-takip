/**
 * Health Check API
 * GET /api/health
 *
 * Checks the health of the application and database connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '@/lib/database/config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbHealthy = await healthCheck();
    const dbResponseTime = Date.now() - startTime;

    if (!dbHealthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: {
            connected: false,
            responseTime: dbResponseTime,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: dbResponseTime,
      },
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
