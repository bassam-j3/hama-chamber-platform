import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Global() // 👈 هذه الكلمة السحرية تجعل الإيميل متاحاً في كل المشروع تلقائياً
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get('SMTP_PORT'),
          secure: config.get('SMTP_PORT') == 465, // true if port is 465
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"غرفة تجارة حماة" <${config.get('SMTP_USER')}>`,
        },
      }),
    }),
  ],
  exports: [MailerModule], // 👈 تصدير الخدمة لتستخدمها باقي الموديولات
})
export class MailModule {}
