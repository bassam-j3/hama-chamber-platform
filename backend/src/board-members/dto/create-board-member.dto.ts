import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBoardMemberDto {
  @IsString()
  name: string;

  @IsString()
  roleTitle: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}