import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initAdmin (Security Test)', () => {
    it('should NOT return plaintext password in the response', async () => {
      // إعداد بيئة الاختبار: لا يوجد مستخدمين
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.user.create.mockResolvedValue({
        id: '123',
        email: 'admin@hamachamber.com',
      });

      const result = await service.initAdmin();

      // التأكد من أن الرد يحتوي على الإيميل والرسالة فقط، ولا يحتوي على كلمة المرور
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('email');
      expect(result).not.toHaveProperty('password'); // 👈 التحقق الأمني الحرج
    });

    it('should throw BadRequestException if a user already exists', async () => {
      // إعداد بيئة الاختبار: يوجد مستخدم مسبقاً
      mockPrismaService.user.count.mockResolvedValue(1);

      await expect(service.initAdmin()).rejects.toThrow(BadRequestException);
      await expect(service.initAdmin()).rejects.toThrow(
        'تمت تهيئة حساب المدير مسبقاً، لا يمكن إنشاء حساب جديد بهذه الطريقة',
      );
    });
  });
});