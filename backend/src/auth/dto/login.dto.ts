import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صالحاً' })
  email: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' })
  password: string;
}
