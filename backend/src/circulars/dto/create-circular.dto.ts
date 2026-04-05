import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCircularDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // أضفنا هذا السطر لحل خطأ الـ Service
}