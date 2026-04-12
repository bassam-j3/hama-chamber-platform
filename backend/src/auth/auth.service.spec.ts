import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

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

  describe('login', () => {
    it('should return an access_token when given valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'ADMIN',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'test-token');
      expect(result.user).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = { email: 'wrong@example.com', password: 'password123' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('initAdmin (Security Test)', () => {
    it('should NOT return plaintext password in the response', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.user.create.mockResolvedValue({
        id: '123',
        email: 'admin@hamachamber.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

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
