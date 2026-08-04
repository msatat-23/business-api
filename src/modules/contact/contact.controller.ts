import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Role } from '../../common/enums/role.enum';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Anyone can submit the contact form - signed in or anonymous.
   * OptionalJwtAuthGuard resolves req.user when a valid token is present
   * (so we can link the submission to an account) without requiring one.
   */
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateContactDto,
    @CurrentUser('id') userId: string | undefined,
  ) {
    return this.contactService.create(dto, userId ?? null);
  }

  /**
   * Reviewing submitted leads is restricted to admins.
   */
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.findOne(id);
  }
}
