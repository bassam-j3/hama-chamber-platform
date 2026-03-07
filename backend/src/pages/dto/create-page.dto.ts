// src/pages/dto/create-page.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // 👈 أضف هذا الجزء الخاص بحقل الأمان
  @IsBoolean()
  @IsOptional()
  isSecure?: boolean; 
}