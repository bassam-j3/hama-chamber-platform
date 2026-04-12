import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config'; // 👈 استيراد الإعدادات
import { ScheduleModule } from '@nestjs/schedule'; // 👈 استيراد موديول الجدولة
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesModule } from './pages/pages.module';
import { FaqsModule } from './faqs/faqs.module';
import { BannersModule } from './banners/banners.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { ProjectsModule } from './projects/projects.module';
import { NewsModule } from './news/news.module';
import { LawsModule } from './laws/laws.module';
import { CircularsModule } from './circulars/circulars.module';
import { BoardMembersModule } from './board-members/board-members.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailsModule } from './emails/emails.module'; // 👈 استيراد موديول الإيميلات

@Module({
  imports: [
    // تهيئة موديول الإعدادات وجعله عالمياً ليشمل كل ملفات المشروع
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }), // Registered for Item 3.1
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(), // 👈 تفعيل الجدولة
    PrismaModule,
    CloudinaryModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    PagesModule,
    FaqsModule,
    BannersModule,
    OpportunitiesModule,
    ExhibitionsModule,
    ProjectsModule,
    NewsModule,
    LawsModule,
    CircularsModule,
    BoardMembersModule,
    EmailsModule, // 👈 تسجيل الموديول هنا
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
