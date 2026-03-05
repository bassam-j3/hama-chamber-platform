import { Controller, Get, Param, Put, Query, ParseIntPipe, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EmailsService } from './emails.service';

@Controller('api/v1/emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get('list')
  async getEmails(
    @Query('folder') folder: string = 'INBOX',
    @Query('limit') limit?: string
  ) {
    const fetchLimit = limit ? parseInt(limit, 10) : 15;
    return await this.emailsService.getLatestEmails(folder, fetchLimit);
  }

  @Get('inbox/:id')
  async getEmailDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.emailsService.getEmailDetails(id);
  }

  @Put('inbox/:id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return await this.emailsService.markEmailAsRead(id);
  }

  @Post('send')
  @UseInterceptors(FilesInterceptor('attachments'))
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('html') html: string,
    @UploadedFiles() attachments?: Array<Express.Multer.File>
  ) {
    return await this.emailsService.sendEmail(to, subject, html, attachments);
  }
}