import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { PagesService } from './pages.service';
import { UpdatePageDto } from './dto/update-page.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  /**
   * Everyone can read a page payload by slug - signed in or not.
   */

  @ApiBearerAuth('access-token')
  @Get('')
  getPages() {
    return this.pagesService.getPages();
  }

  @Public()
  @Get(':slug')
  getPage(@Param('slug') slug: string) {
    return this.pagesService.getPage(slug);
  }

  /**
   * Editors and admins can update any page payload by slug.
   */
  @ApiBearerAuth('access-token')
  @Patch(':slug')
  @Roles(Role.EDITOR, Role.ADMIN)
  updatePage(
    @Param('slug') slug: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser('email') email: string,
  ) {
    return this.pagesService.updatePage(slug, dto, email);
  }

  /**
   * Admins can delete a page record by id.
   */
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(Role.ADMIN)
  deletePage(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deletePage(id);
  }
}
