import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body, query, params } = request;

    const startTime = Date.now();

    this.logger.info('HTTP Request', {
      type: 'REQUEST',
      method,
      url,
      query: Object.keys(query).length ? query : undefined,
      params: Object.keys(params).length ? params : undefined,
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const duration = Date.now() - startTime;
          this.logger.info('HTTP Response', {
            type: 'RESPONSE',
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            responseBody: this.sanitizeResponse(responseBody),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error('HTTP Error', {
            type: 'ERROR',
            method,
            url,
            statusCode: error.status || 500,
            duration: `${duration}ms`,
            error: {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
            },
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || Object.keys(body).length === 0) return undefined;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey', 'api_key'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeResponse(response: any): any {
    if (typeof response === 'object' && response !== null) {
      const sanitized = { ...response };
      const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];

      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }

      try {
        const stringified = JSON.stringify(sanitized);
        if (stringified.length > 1000) {
          return { _truncated: true, _size: stringified.length };
        }
      } catch (error) {
        return { _error: 'Could not stringify response (circular structure?)' };
      }

      return sanitized;
    }

    return response;
  }
}
