// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // هذا المزخرف يجعل الخدمة متاحة في كل المشروع تلقائياً
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // إلزامي لتتمكن الوحدات الأخرى من استخدامه
})
export class PrismaModule {}
