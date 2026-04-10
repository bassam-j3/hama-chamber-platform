import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module'; // أضفنا هذا السطر

@Module({
  imports: [PrismaModule], // وأضفناه هنا
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
