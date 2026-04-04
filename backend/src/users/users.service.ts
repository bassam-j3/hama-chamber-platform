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

  update(id: string, data: any) {
    return this.prisma.user.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // 👇 Restored methods
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // In a real application, you would send an email here.
    // For now, we return it to the controller (or log it).
    console.log(`Reset token for ${email}: ${token}`);
    
    return { message: 'Password reset token generated (check console/logs)' };
  }

  async resetPassword(token: string, newPassword: string) {
     const user = await this.prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() } // Ensure not expired
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