import { Body, Controller, Get, Patch } from '@nestjs/common';
import { HomeService } from './home.service';
import { UpdateHomeDto } from './dto/update-home.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  /**
   * Everyone can read the home page content - signed in or not.
   */
  @Public()
  @Get()
  getHome() {
    return this.homeService.getHome();
  }

  /**
   * Editors and admins can update the home page entirely (or any subset
   * of sections - all fields in UpdateHomeDto are optional).
   */
  @Patch()
  @Roles(Role.EDITOR, Role.ADMIN)
  updateHome(
    @Body() dto: UpdateHomeDto,
    @CurrentUser('email') email: string,
  ) {
    return this.homeService.updateHome(dto, email);
  }
}
