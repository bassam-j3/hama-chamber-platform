import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateLawDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // أضفنا هذا السطر لحل خطأ الـ Service
}
