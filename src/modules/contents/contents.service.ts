import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getContents() {
    return this.prisma.content.findMany();
  }

  async getContent(slug: string) {
    const content = await this.prisma.content.findUnique({
      where: { slug },
    });

    if (!content) {
      throw new NotFoundException(`Content with slug "${slug}" was not found`);
    }

    return content;
  }

  async updateContent(slug: string, dto: UpdateContentDto, updatedByEmail: string) {
    const createData: Prisma.ContentCreateInput = {
      slug,
      content: dto.content ?? {},
      updatedByEmail,
    };

    const updateData: Prisma.ContentUpdateInput = {
      content: dto.content ?? {},
      updatedByEmail,
    };

    return this.prisma.content.upsert({
      where: { slug },
      create: createData,
      update: updateData,
    });
  }

  async deleteContent(id: number) {
    const content = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with id "${id}" was not found`);
    }

    return this.prisma.content.delete({
      where: { id },
    });
  }
}
