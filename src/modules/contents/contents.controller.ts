import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ContentsService } from './contents.service';
import { UpdateContentDto } from './dto/update-content.dto';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  /**
   * Everyone can read all content records.
   */
  @ApiBearerAuth('access-token')
  @Get('')
  getContents() {
    return this.contentsService.getContents();
  }

  /**
   * Everyone can read a content record by slug.
   */
  @Public()
  @Get(':slug')
  getContent(@Param('slug') slug: string) {
    return this.contentsService.getContent(slug);
  }

  /**
   * Editors and admins can create/update content by slug.
   */
  @ApiBearerAuth('access-token')
  @Patch(':slug')
  @Roles(Role.EDITOR, Role.ADMIN)
  updateContent(
    @Param('slug') slug: string,
    @Body() dto: UpdateContentDto,
    @CurrentUser('email') email: string,
  ) {
    return this.contentsService.updateContent(slug, dto, email);
  }

  /**
   * Admins can delete content by id.
   */
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(Role.ADMIN)
  deleteContent(@Param('id', ParseIntPipe) id: number) {
    return this.contentsService.deleteContent(id);
  }
}
