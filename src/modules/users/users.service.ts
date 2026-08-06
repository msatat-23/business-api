import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { USERS_PAGE_SIZE } from '../../common/constants/pagination.constants';
import { UserRoleFilter } from '../../common/enums/user-role-filter.enum';
import { UserStatusFilter } from '../../common/enums/user-status-filter.enum';
import { PrismaService } from '../../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Role } from '../../common/enums/role.enum';

const SALT_ROUNDS = 10;

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto, role: Role = Role.USER) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        role: dto.role ?? role,
      },
      select: SAFE_USER_SELECT,
    });
  }

  async findAll(query: FindUsersQueryDto = {}) {
    const where: Prisma.UserWhereInput = {};

    if (query.status === UserStatusFilter.ACTIVE) {
      where.isActive = true;
    } else if (query.status === UserStatusFilter.INACTIVE) {
      where.isActive = false;
    }

    if (query.role && query.role !== UserRoleFilter.ALL) {
      where.role = query.role;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { createdAt: 'desc' as const };

    if (query.page !== undefined) {
      const pageSize = query.pageSize ?? USERS_PAGE_SIZE;
      const skip = (query.page - 1) * pageSize;

      const [items, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          select: SAFE_USER_SELECT,
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        items,
        meta: {
          total,
          page: query.page,
          pageCount: Math.ceil(total / pageSize),
          pageSize,
        },
      };
    }

    return this.prisma.user.findMany({ where, orderBy, select: SAFE_USER_SELECT });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    const updateData: any = {};
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: SAFE_USER_SELECT,
    });
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: SAFE_USER_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }
}
