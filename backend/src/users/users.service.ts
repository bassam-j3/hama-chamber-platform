import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 1. إضافة مستخدم جديد مع تشفير الباسورد
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existingUser) throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'editor',
      },
    });

    const { password, ...result } = user; // إخفاء الباسورد من النتيجة
    return result;
  }

  // 2. جلب كل المستخدمين (مع إخفاء الباسوردات)
  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    return users;
  }

  // 3. تعديل مستخدم
  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    
    // إذا تم إرسال باسورد جديد، قم بتشفيره
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password, ...result } = user;
    return result;
  }

  // 4. حذف مستخدم
  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // ================= ميزات الـ Senior: استعادة كلمة المرور ================= //

  // أ. طلب استعادة كلمة المرور
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('البريد الإلكتروني غير موجود');

    // توليد توكن عشوائي آمن
    const resetToken = crypto.randomBytes(32).toString('hex');
    // تشفير التوكن قبل حفظه في قاعدة البيانات (لزيادة الأمان)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // التوكن ينتهي بعد 15 دقيقة
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { resetPasswordToken: hashedToken, resetPasswordExpires: expires },
    });

    // في المشاريع الحقيقية نرسل التوكن عبر الإيميل (Nodemailer أو SendGrid)
    // حالياً سنرجعه في الـ Response لكي نستخدمه في الواجهة الأمامية
    return { 
      message: 'تم إنشاء رابط استعادة كلمة المرور', 
      resetToken // هذا التوكن سيرسل كـ رابط للمستخدم
    };
  }

  // ب. تعيين كلمة المرور الجديدة
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() }, // يجب أن يكون التوكن غير منتهي
      },
    });

    if (!user) throw new BadRequestException('الرابط غير صالح أو منتهي الصلاحية');

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        resetPasswordToken: null, // تصفير التوكن
        resetPasswordExpires: null,
      },
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}