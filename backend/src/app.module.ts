import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module'; 
import { EmailsModule } from './emails/emails.module'; 

// 👇 1. استيراد موديول Cloudinary الجديد
import { CloudinaryModule } from './cloudinary/cloudinary.module';

import { BoardMembersModule } from './board-members/board-members.module';
import { ProjectsModule } from './projects/projects.module';
import { CircularsModule } from './circulars/circulars.module';
import { LawsModule } from './laws/laws.module';
import { NewsModule } from './news/news.module';
import { PricesModule } from './prices/prices.module';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { BannersModule } from './banners/banners.module';
import { FaqsModule } from './faqs/faqs.module';
import { PagesModule } from './pages/pages.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    MailModule, 
    EmailsModule, 
    
    // 👇 2. تفعيل موديول Cloudinary هنا ليعمل في كل النظام
    CloudinaryModule,

    BoardMembersModule,
    ProjectsModule,
    CircularsModule,
    LawsModule,
    NewsModule,
    PricesModule,
    ExhibitionsModule,
    OpportunitiesModule,
    BannersModule,
    FaqsModule,
    PagesModule,
    DashboardModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}