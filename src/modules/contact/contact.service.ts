import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

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

  findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
}
