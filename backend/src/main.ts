import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 👈 1. استيراد الفلتر

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // السماح للفرونت إند بالاتصال بالباكند (CORS)
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 👇 2. تفعيل الفلتر الشامل على كل مسارات المشروع
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 👈 يقوم بمسح أي حقول إضافية غير موجودة في الـ DTO
      transform: true, // 👈 يحول البيانات القادمة إلى النوع الصحيح (مثلاً String إلى Number)
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();