import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. Strict Environment Validation (Fail-Safe)
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'CLOUDINARY_URL',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error(`❌ CRITICAL: Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('🛑 The application will refuse to boot until these are provided.');
    process.exit(1); // Kill the process immediately
  }

  const app = await NestFactory.create(AppModule);

  // 👇 السطر السحري الذي كان مفقوداً وتمت إضافته لحل الـ 404 👇
  app.setGlobalPrefix('api/v1');

  // حماية الـ Headers
  app.use(helmet());
  
  // إعدادات الـ CORS الآمنة (الآن نضمن وجود FRONTEND_URL بفضل التحقق أعلاه)
  const allowedOrigins = process.env.FRONTEND_URL!.split(',');

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // التحقق الصارم من البيانات
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // تفعيل توحيد الردود الناجحة
  app.useGlobalInterceptors(new ResponseInterceptor());

  // تفعيل توحيد الأخطاء
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application successfully booted and running on port: ${port}`);
}
bootstrap();