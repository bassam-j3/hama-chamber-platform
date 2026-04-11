import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client'; // 👈 استيراد الـ Enum

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // مسار متاح للجميع (نسيان كلمة المرور) - لا نضع عليه UseGuards
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  // مسار متاح للجميع (إعادة تعيين كلمة المرور)
  @Post('reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
  ) {
    return this.usersService.resetPassword(token, password);
  }

  // ================= مسارات محمية ================= //

  // فقط الـ ADMIN يستطيع إضافة مدراء
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // 👈 تم إزالة علامات التنصيص لاستخدام الـ Enum مباشرة
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // أي مدير مسجل دخول يمكنه رؤية قائمة المستخدمين
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  // الـ ADMIN فقط يستطيع التعديل أو الحذف
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // 👈 تم التعديل هنا
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // 👈 تم التعديل هنا
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
