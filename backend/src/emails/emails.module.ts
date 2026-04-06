import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 استيراد موديل الإعدادات
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';

@Module({
  imports: [ConfigModule], // 👈 إضافة الاستيراد هنا ليعمل ConfigService داخل الخدمة
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}