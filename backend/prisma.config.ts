// backend/prisma.config.ts
import { defineConfig, env } from 'prisma/config';
import 'dotenv/config'; // إلزامي لقراءة ملف .env قبل التشغيل

export default defineConfig({
  // 1. توجيه Prisma لمكان ملف المخطط
  schema: 'prisma/schema.prisma',
  
  // 2. إعداد مصدر البيانات (Datasource) بشكل صحيح
  datasource: {
    url: env('DATABASE_URL'),
  },
});