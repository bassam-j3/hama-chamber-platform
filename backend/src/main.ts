import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'CLOUDINARY_URL',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error(
      `❌ CRITICAL: Missing required environment variables: ${missingVars.join(', ')}`,
    );
    logger.error(
      '🛑 The application will refuse to boot until these are provided.',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // 👇 أعد هذه البادئة هنا، هذا هو مكانها الصحيح 👇
  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  const allowedOrigins = process.env.FRONTEND_URL!.split(',');

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application successfully booted and running on port: ${port}`);
}
bootstrap();
