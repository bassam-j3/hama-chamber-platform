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

@Catch() // 👈 تركها فارغة يعني أنه سيصطاد "جميع" أنواع الأخطاء حتى التي لم نتوقعها
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // تحديد كود الحالة (مثلاً 400 للبيانات الخاطئة، 404 لغير الموجود، أو 500 لخطأ السيرفر)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // استخراج رسالة الخطأ
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'حدث خطأ داخلي في الخادم';

    // تنسيق رسالة الخطأ (لأن NestJS أحياناً يرجعها كنص وأحياناً ككائن Object)
    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exceptionResponse;

    // طباعة الخطأ في الـ Terminal للمطور (يساعدك جداً في اكتشاف الأخطاء)
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(errorMessage)}`,
    );

    // إرسال الرد الموحد للفرونت إند
    response.status(status).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
