import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // هذا المسار لإنشاء أول مدير، بمجرد استخدامه سيتوقف عن العمل لحماية النظام
  @Post('init-admin')
  initAdmin() {
    return this.authService.initAdmin();
  }
}