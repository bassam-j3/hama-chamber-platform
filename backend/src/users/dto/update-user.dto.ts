import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator'; // استيراد أدوات التحقق

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional() // نخبر الباكند أن هذا الحقل اختياري
  @IsBoolean() // ونتأكد أنه قيمة منطقية (True/False)
  isActive?: boolean;
}
