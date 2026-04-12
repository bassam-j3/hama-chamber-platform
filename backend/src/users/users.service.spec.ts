import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should only return active users (isActive: true)', async () => {
      const users = [
        { id: '1', name: 'User 1', isActive: true },
        { id: '2', name: 'User 2', isActive: true },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual(users);
    });
  });

  describe('remove', () => {
    it('should correctly perform a soft delete (updates isActive to false)', async () => {
      const userId = '123';
      const softDeletedUser = { id: userId, isActive: false };

      mockPrismaService.user.update.mockResolvedValue(softDeletedUser);

      const result = await service.remove(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: false },
      });
      expect(result).toEqual(softDeletedUser);
    });
  });
});
