import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomePage } from './entities/home-page.entity';
import { UpdateHomeDto } from './dto/update-home.dto';

const SINGLETON_ID = 1;

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomePage)
    private readonly homeRepository: Repository<HomePage>,
  ) {}

  /**
   * Returns the singleton home page row, creating an empty one on first
   * access if it hasn't been seeded yet (defensive - normally `npm run seed`
   * populates it from /database/seeds/data/*.json on setup).
   */
  async getHome(): Promise<HomePage> {
    let home = await this.homeRepository.findOne({ where: { id: SINGLETON_ID } });

    if (!home) {
      home = this.homeRepository.create({ id: SINGLETON_ID });
      home = await this.homeRepository.save(home);
    }

    return home;
  }

  async updateHome(dto: UpdateHomeDto, updatedByEmail: string): Promise<HomePage> {
    const home = await this.getHome();
    Object.assign(home, dto, { updatedByEmail });
    return this.homeRepository.save(home);
  }
}
