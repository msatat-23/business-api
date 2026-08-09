import { Module } from '@nestjs/common';

import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';

import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
