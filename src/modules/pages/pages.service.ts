import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPage(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" was not found`);
    }

    return page;
  }

  async updatePage(slug: string, dto: UpdatePageDto, updatedByEmail: string) {
    const createData: Prisma.PageCreateInput = {
      slug,
      content: dto.content ?? {},
      updatedByEmail,
    };
    const updateData: Prisma.PageUpdateInput = {
      content: dto.content ?? {},
      updatedByEmail,
    };

    return this.prisma.page.upsert({
      where: { slug },
      create: createData,
      update: updateData,
    });
  }
}
