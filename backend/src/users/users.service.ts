import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // 1. التحقق من عدم وجود الإيميل مسبقاً
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    // 2. 👈 تشفير كلمة المرور قبل الحفظ
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        password: hashedPassword, // حفظ الكلمة المشفرة
      },
    });
  }

  findAll() {
    // جلب المستخدمين بدون إرسال كلمات المرور للواجهة الأمامية لأسباب أمنية
    return this.prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isActive: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
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

    // 3. 👈 إذا قام المدير بتغيير كلمة المرور أثناء التعديل، قم بتشفيرها
    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: string) {
    // 4. الحذف المرن (Soft Delete) للمستخدمين لمنع انهيار السجلات المرتبطة
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }
}