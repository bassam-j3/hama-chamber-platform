import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // 👈 تم الاستيراد بنجاح

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. دالة تسجيل الدخول
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const payload = { email: user.email, sub: user.id, name: user.name, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  // 2. دالة لإنشاء أول مدير في النظام (تُستخدم مرة واحدة فقط)
  async initAdmin() {
    const usersCount = await this.prisma.user.count();
    if (usersCount > 0) {
      throw new BadRequestException('تمت تهيئة حساب المدير مسبقاً، لا يمكن إنشاء حساب جديد بهذه الطريقة');
    }

    // 👈 الإصلاح الأمني: جلب كلمة المرور من متغيرات البيئة (مع قيمة افتراضية للبيئة التطويرية)
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const admin = await this.prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@hamachamber.com', // 👈 استخدام البيئة للبريد أيضاً
        password: hashedPassword,
        role: Role.ADMIN, // 👈 الإصلاح البرمجي: استخدام الـ Enum المطابق لقاعدة البيانات بدلاً من النص
      },
    });

    return { 
      message: 'تم إنشاء حساب المدير بنجاح', 
      email: admin.email, 
      password: defaultPassword // ملاحظة: من الأفضل عدم إرجاع كلمة المرور في الرد النهائي (Response) عند نقل المشروع للإنتاج (Production)
    };
  }
}