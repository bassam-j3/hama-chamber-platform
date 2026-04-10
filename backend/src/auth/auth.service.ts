import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async initAdmin() {
    const usersCount = await this.prisma.user.count();
    if (usersCount > 0) {
      throw new BadRequestException(
        'تمت تهيئة حساب المدير مسبقاً، لا يمكن إنشاء حساب جديد بهذه الطريقة',
      );
    }

    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const admin = await this.prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@hamachamber.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    return {
      message: 'تم إنشاء حساب المدير بنجاح',
      email: admin.email,
    };
  }
}
