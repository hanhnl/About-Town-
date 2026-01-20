// API utility functions for standardized responses and error handling

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
}

// Standardized success response wrapper
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

// Standardized error response wrapper
export function errorResponse(
  error: string,
  statusCode: number = 500,
  message?: string
): ApiErrorResponse {
  return {
    success: false,
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

// Error classification
export enum ApiErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static validationError(message: string, details?: any): ApiError {
    return new ApiError(ApiErrorType.VALIDATION_ERROR, 400, message, details);
  }

  static notFound(resource: string = 'Resource'): ApiError {
    return new ApiError(ApiErrorType.NOT_FOUND, 404, `${resource} not found`);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(ApiErrorType.UNAUTHORIZED, 401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(ApiErrorType.FORBIDDEN, 403, message);
  }

  static rateLimitExceeded(message?: string): ApiError {
    return new ApiError(
      ApiErrorType.RATE_LIMIT_EXCEEDED,
      429,
      message || 'Too many requests'
    );
  }

  static externalApiError(service: string, originalError?: any): ApiError {
    return new ApiError(
      ApiErrorType.EXTERNAL_API_ERROR,
      503,
      `External API error: ${service}`,
      originalError
    );
  }

  static databaseError(message?: string): ApiError {
    return new ApiError(
      ApiErrorType.DATABASE_ERROR,
      500,
      message || 'Database error occurred'
    );
  }

  static internalError(message?: string): ApiError {
    return new ApiError(
      ApiErrorType.INTERNAL_ERROR,
      500,
      message || 'Internal server error'
    );
  }

  static serviceUnavailable(service?: string): ApiError {
    return new ApiError(
      ApiErrorType.SERVICE_UNAVAILABLE,
      503,
      service ? `${service} is currently unavailable` : 'Service unavailable'
    );
  }

  toJSON(): ApiErrorResponse {
    return errorResponse(this.type, this.statusCode, this.message);
  }
}

// Environment variable validation
export interface EnvConfig {
  required?: string[];
  optional?: string[];
}

export function validateEnvVariables(config: EnvConfig): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  if (config.required) {
    for (const varName of config.required) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }
  }

  // Check optional variables (warnings only)
  if (config.optional) {
    for (const varName of config.optional) {
      if (!process.env[varName]) {
        warnings.push(`Optional: ${varName} is not set`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

// Async error handler wrapper
export function asyncHandler(
  fn: (req: any, res: any, next?: any) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Health check utility
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
  };
  timestamp: string;
}

export async function performHealthCheck(
  checks: Record<string, () => Promise<boolean>>
): Promise<HealthCheckResult> {
  const results: HealthCheckResult['checks'] = {};
  let healthyCount = 0;
  let totalCount = 0;

  for (const [name, checkFn] of Object.entries(checks)) {
    totalCount++;
    const startTime = Date.now();

    try {
      const result = await checkFn();
      const responseTime = Date.now() - startTime;

      results[name] = {
        status: result ? 'ok' : 'error',
        responseTime,
        message: result ? undefined : 'Check failed',
      };

      if (result) healthyCount++;
    } catch (error) {
      results[name] = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      };
    }
  }

  const status =
    healthyCount === totalCount
      ? 'healthy'
      : healthyCount > 0
        ? 'degraded'
        : 'unhealthy';

  return {
    status,
    checks: results,
    timestamp: new Date().toISOString(),
  };
}
