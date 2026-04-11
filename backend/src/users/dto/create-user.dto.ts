import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Role } from '@prisma/client'; // 👈 1. استيراد الـ Enum من Prisma

export class CreateUserDto {
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صالحاً' })
  email: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'الصلاحية غير صالحة' }) // 👈 2. التحقق باستخدام IsEnum بدلاً من IsIn
  role?: Role; // 👈 3. استخدام نوع Role بدلاً من string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
