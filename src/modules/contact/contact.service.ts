import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CONTACTS_PAGE_SIZE } from '../../common/constants/pagination.constants';
import { ContactStatusFilter } from '../../common/enums/contact-status-filter.enum';
import { PrismaService } from '../../config/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { FindContactsQueryDto } from './dto/find-contacts-query.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactDto, submittedByUserId: string | null) {
    return this.prisma.contact.create({
      data: {
        ...dto,
        submittedByUserId,
      },
    });
  }

  async findAll(query: FindContactsQueryDto = {}) {
    const where: Prisma.ContactWhereInput = {};

    if (query.contactStatus && query.contactStatus !== ContactStatusFilter.ALL) {
      where.contactStatus = query.contactStatus;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { createdAt: 'desc' as const };

    if (query.page !== undefined) {
      const pageSize = query.pageSize ?? CONTACTS_PAGE_SIZE;
      const skip = (query.page - 1) * pageSize;

      const [items, total] = await Promise.all([
        this.prisma.contact.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        this.prisma.contact.count({ where }),
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

    return this.prisma.contact.findMany({ where, orderBy });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });
    if (!contact) {
      throw new NotFoundException(`Contact submission with id "${id}" not found`);
    }
    return contact;
  }

  async updateContactStatus(id: string, dto: UpdateContactStatusDto) {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { contactStatus: dto.contactStatus },
    });
    if (!contact) {
      throw new NotFoundException(`Contact submission with id "${id}" not found`);
    }
    return contact;
  }
}
