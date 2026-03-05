import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';

@Module({
  controllers: [EmailsController], // 👈 يجب أن يكون هنا
  providers: [EmailsService],
})
export class EmailsModule {}