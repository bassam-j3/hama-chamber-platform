import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; // 👈 استيراد الـ Enum

export const ROLES_KEY = 'roles';
// 👈 الدالة الآن تقبل Role فقط (مثلاً: @Roles(Role.ADMIN))
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);