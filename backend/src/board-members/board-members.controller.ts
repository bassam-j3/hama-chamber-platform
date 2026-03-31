import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BoardMembersService } from './board-members.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('api/v1/board-members')
export class BoardMembersController {
  constructor(
    private readonly boardMembersService: BoardMembersService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'board-members');
      imageUrl = uploadResult.secure_url;
    }

    const dto = {
      name: body.name,
      roleTitle: body.roleTitle,
      isActive: body.isActive !== 'false', 
      imageUrl: imageUrl,
    };
    return this.boardMembersService.create(dto);
  }

  @Get()
  findAll() {
    return this.boardMembersService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard) 
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = {
      name: body.name,
      roleTitle: body.roleTitle,
      isActive: body.isActive !== 'false',
    };
    
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'board-members');
      dto.imageUrl = uploadResult.secure_url;
    }
    
    return this.boardMembersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) 
  remove(@Param('id') id: string) {
    return this.boardMembersService.remove(id);
  }
}