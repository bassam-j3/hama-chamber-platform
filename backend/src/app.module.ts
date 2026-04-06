import { Module } from '@nestjs/common';
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
// 👇 أضف هذا الاستيراد 👇
import { BoardMembersModule } from './board-members/board-members.module'; 

@Module({
  imports: [
    PrismaModule,
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
    BoardMembersModule, // 👈 وأضفه هنا ليتعرف عليه السيرفر
  ],
})
export class AppModule {}