import { Controller, Get, Query } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get('inbox')
  async getInbox(@Query('limit') limit?: string) {
    const fetchLimit = limit ? parseInt(limit, 10) : 15;
    return await this.emailsService.getLatestEmails(fetchLimit);
  }
}