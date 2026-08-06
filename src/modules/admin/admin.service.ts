import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [users, pages, contacts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.page.count(),
      this.prisma.contact.count(),
    ]);

    return { users, pages, contacts };
  }
}
