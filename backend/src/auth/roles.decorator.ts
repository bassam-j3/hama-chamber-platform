import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// هذه الدالة ستسمح لنا بكتابة @Roles('super_admin') فوق أي مسار
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);