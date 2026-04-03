import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initAdmin (Security Test)', () => {
    it('should NOT return plaintext password in the response', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.user.create.mockResolvedValue({
        id: '123',
        email: 'admin@hamachamber.com',
      });

      const result = await service.initAdmin();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('email');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if a user already exists', async () => {
      mockPrismaService.user.count.mockResolvedValue(1);

      await expect(service.initAdmin()).rejects.toThrow(BadRequestException);
    });
  });
});