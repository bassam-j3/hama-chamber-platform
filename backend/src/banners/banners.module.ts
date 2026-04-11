import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // 👈 استيراد موديل كلاوديناري

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule, // 👈 إضافته هنا ليصبح متاحاً للكونترولر والسيرفس
  ],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
