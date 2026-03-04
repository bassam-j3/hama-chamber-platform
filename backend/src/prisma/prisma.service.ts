// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // إلزامي لضمان توفر الرابط قبل بناء مجمع الاتصالات

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. لا مسارات سعيدة: نتحقق من وجود الرابط في البيئة أولاً
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('CRITICAL ERROR: DATABASE_URL is missing in environment variables.');
    }

    // 2. بناء مجمع الاتصالات (Connection Pool) بصرامة
    const pool = new Pool({ connectionString });
    
    // 3. تغليف المجمع بمحول Prisma
    const adapter = new PrismaPg(pool);

    // 4. التمرير الإلزامي للمحول في Prisma 7
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // إغلاق الاتصال بأمان عند إطفاء الخادم لمنع تسرب الذاكرة (Memory Leaks)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}