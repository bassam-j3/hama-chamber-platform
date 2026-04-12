// backend/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exceptionResponse;

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Log detailed error
    const logData = {
      method: request.method,
      url: request.url,
      status,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      stack:
        isDevelopment && exception instanceof Error
          ? exception.stack
          : undefined,
    };

    // Redact sensitive body data if needed, but we avoid logging body here for security
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`,
      isDevelopment && exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Only include stack trace in development
      stack:
        isDevelopment && exception instanceof Error
          ? exception.stack
          : undefined,
    });
  }
}
