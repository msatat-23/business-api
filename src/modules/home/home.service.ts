import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UpdateHomeDto } from './dto/update-home.dto';

const SINGLETON_ID = 1;

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the singleton home page row, creating an empty one on first
   * access if it hasn't been seeded yet (defensive - normally `npm run seed`
   * populates it from /database/seeds/data/*.json on setup).
   */
  async getHome() {
    let home = await this.prisma.homePage.findUnique({
      where: { id: SINGLETON_ID },
    });

    if (!home) {
      home = await this.prisma.homePage.create({
        data: { id: SINGLETON_ID },
      });
    }

    return home;
  }

  async updateHome(dto: UpdateHomeDto, updatedByEmail: string) {
    const updateData = { ...dto, updatedByEmail };

    return this.prisma.homePage.update({
      where: { id: SINGLETON_ID },
      data: updateData,
    });
  }
}
