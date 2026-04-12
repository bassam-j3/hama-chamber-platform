import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async update(id: string, data: any) {
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ==========================================
  // 👇 دوال استعادة كلمة المرور المفقودة 👇
  // ==========================================

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('البريد الإلكتروني غير موجود');
    }

    // توليد رمز استعادة عشوائي (Token)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // صالح لمدة ساعة واحدة

    // حفظ الرمز في قاعدة البيانات
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      },
    });

    // ملاحظة: في بيئة الإنتاج الفعلية، هنا يتم إرسال إيميل حقيقي للمستخدم
    // حالياً نعيد التوكن للواجهة (كمثال/أو بيئة تطوير)
    return {
      message: 'تم إنشاء رابط استعادة كلمة المرور',
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // البحث عن المستخدم باستخدام الرمز والتأكد من عدم انتهاء صلاحيته
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('رمز الاستعادة غير صالح أو منتهي الصلاحية');
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // تحديث كلمة المرور وحذف رمز الاستعادة
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
  }
}
