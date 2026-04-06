import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  update(id: string, data: any) {
    return this.prisma.user.update({ 
      where: { id }, 
      data 
    });
  }

  async remove(id: string) {
    // Ensure user exists and is active before deleting
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new NotFoundException('User with this email not found or inactive');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    console.log(`Reset token for ${email}: ${token}`);
    
    return { message: 'Password reset token generated (check console/logs)' };
  }

  async resetPassword(token: string, newPassword: string) {
     const user = await this.prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() },
            isActive: true
        }
     });

     if (!user) {
         throw new BadRequestException('Invalid or expired reset token');
     }

     const hashedPassword = await bcrypt.hash(newPassword, 10);

     await this.prisma.user.update({
         where: { id: user.id },
         data: {
             password: hashedPassword,
             resetPasswordToken: null,
             resetPasswordExpires: null
         }
     });

     return { message: 'Password successfully reset' };
  }
}