import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

interface CleanableRecord {
  id: string;
  imageUrl: string | null;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly prisma: PrismaService) {}

  uploadImage(
    file: Express.Multer.File,
    folderName: string = 'hama-chamber',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) return reject(new Error(error.message || 'Upload error'));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(new Error(error.message || 'Delete error'));
        resolve(result);
      });
    });
  }

  private extractPublicId(url: string): string | null {
    try {
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex === -1) return null;

      const afterUpload = url.substring(uploadIndex + 8);
      const parts = afterUpload.split('/');

      if (parts[0].match(/^v\d+$/)) {
        parts.shift();
      }

      const fileWithExt = parts.join('/');
      const lastDotIndex = fileWithExt.lastIndexOf('.');
      if (lastDotIndex === -1) return fileWithExt;

      return fileWithExt.substring(0, lastDotIndex);
    } catch {
      return null;
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleCronOrphanMediaCleanup() {
    this.logger.log('Starting Cloudinary Orphan Media Cleanup Cron Job...');

    let deletedCount = 0;

    const processRecords = async (
      modelName: 'news' | 'project' | 'exhibition' | 'opportunity' | 'circular' | 'boardMember',
      records: CleanableRecord[],
    ) => {
      for (const record of records) {
        if (record.imageUrl) {
          const publicId = this.extractPublicId(record.imageUrl);
          if (publicId) {
            try {
              await this.deleteImage(publicId);
              
              // @ts-expect-error Prisma dynamic model access
              await this.prisma[modelName].update({
                where: { id: record.id },
                data: { imageUrl: null },
              });
              
              deletedCount++;
              this.logger.log(
                `Deleted Cloudinary asset ${publicId} for ${modelName} ID: ${record.id}`,
              );
            } catch (error) {
              const err = error as Error;
              this.logger.error(
                `Failed to delete asset ${publicId}: ${err.message}`,
              );
            }
          }
        }
      }
    };

    try {
      const news = await this.prisma.news.findMany({
        where: { isActive: false, imageUrl: { not: null } },
      });
      await processRecords('news', news);

      const projects = await this.prisma.project.findMany({
        where: { isActive: false, imageUrl: { not: null } },
      });
      await processRecords('project', projects);

      const exhibitions = await this.prisma.exhibition.findMany({
        where: { isActive: false, imageUrl: { not: null } },
      });
      await processRecords('exhibition', exhibitions);

      const opportunities = await this.prisma.opportunity.findMany({
        where: { isActive: false, imageUrl: { not: null } },
      });
      await processRecords('opportunity', opportunities);

      const circulars = await this.prisma.circular.findMany({
        where: { isActive: false, imageUrl: { not: null } },
      });
      await processRecords('circular', circulars);

      const boardMembers = await this.prisma.boardMember.findMany({
        where: { isActive: false, imageUrl: { not: null } },
      });
      await processRecords('boardMember', boardMembers);

      this.logger.log(
        `Cloudinary Orphan Media Cleanup completed. Total deleted: ${deletedCount}`,
      );
    } catch (error) {
      this.logger.error('Error during Cloudinary Orphan Media Cleanup', error);
    }
  }
}
