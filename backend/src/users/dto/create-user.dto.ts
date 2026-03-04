import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn, IsBoolean } from 'class-validator';

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
  @IsIn(['super_admin', 'admin', 'editor'], { message: 'الدور غير صالح' })
  role?: string;

  // 👇 هذا هو الجزء الذي كان يسبب المشكلة، أضفناه الآن 👇
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}