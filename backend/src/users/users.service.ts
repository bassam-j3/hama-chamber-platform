import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer'; // 👈 استيراد خدمة الإيميل

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService, // 👈 حقن خدمة الإيميل هنا
  ) {}

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

  // أ. طلب استعادة كلمة المرور وإرسال الإيميل
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('البريد الإلكتروني غير موجود');

    // توليد توكن عشوائي آمن (هذا الذي سيتم إرساله للمستخدم)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // تشفير التوكن قبل حفظه في قاعدة البيانات (لزيادة الأمان)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // التوكن ينتهي بعد 15 دقيقة
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { resetPasswordToken: hashedToken, resetPasswordExpires: expires },
    });

    // 👈 تجهيز رابط الاستعادة (انتبه: استخدمنا resetToken غير المشفر للرابط)
    // إذا كان الفرونت إند يعمل على بورت آخر غير 5173، قم بتغييره هنا
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // 👈 إرسال الإيميل الفعلي
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'استعادة كلمة المرور - بوابة إدارة غرفة تجارة حماة',
        html: `
          <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 30px; background-color: #f6f8f8; color: #11211f; line-height: 1.6;">
            <div style="background-color: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; border-top: 6px solid #0a4d44; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #0a4d44; margin: 0; font-size: 24px;">غرفة تجارة حماة</h2>
                <p style="color: #B9A779; margin: 5px 0 0 0; font-size: 14px;">بوابة الإدارة المركزية</p>
              </div>

              <h3 style="text-align: center; color: #333;">طلب تعيين كلمة مرور جديدة</h3>
              
              <p style="font-size: 16px;">مرحباً <strong>${user.name}</strong>،</p>
              <p style="font-size: 16px; color: #555;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. يرجى الضغط على الزر أدناه لتعيين كلمة مرور جديدة (هذا الرابط صالح لمدة 15 دقيقة فقط):</p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="background-color: #B9A779; color: #0a4d44; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">إعادة تعيين كلمة المرور</a>
              </div>
              
              <p style="font-size: 14px; color: #888;">إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة بأمان، ولن يتم تغيير كلمة مرورك.</p>
              
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
              
              <p style="font-size: 12px; text-align: center; color: #aaa;">هذه رسالة تلقائية من نظام غرفة تجارة حماة، يرجى عدم الرد عليها.</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('فشل إرسال البريد الإلكتروني، يرجى التأكد من إعدادات السيرفر أو المحاولة لاحقاً');
    }

    // 👈 إرجاع رسالة نجاح فقط (حذفنا resetToken من النتيجة للأمان التام)
    return { 
      message: 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني بنجاح.'
    };
  }

  // ب. تعيين كلمة المرور الجديدة
  async resetPassword(token: string, newPassword: string) {
    // تشفير التوكن القادم من الرابط لمطابقته مع التوكن المحفوظ في الداتا بيز
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