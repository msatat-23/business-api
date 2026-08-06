import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Role } from '../../common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FindContactsQueryDto } from './dto/find-contacts-query.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

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
  create(@Body() dto: CreateContactDto, @CurrentUser('id') userId: string | undefined) {
    return this.contactService.create(dto, userId ?? null);
  }

  /**
   * Reviewing submitted leads is restricted to admins.
   */

  @ApiBearerAuth('access-token')
  @Get()
  @Roles(Role.ADMIN, Role.EDITOR)
  findAll(@Query() query: FindContactsQueryDto) {
    return this.contactService.findAll(query);
  }
  @ApiBearerAuth('access-token')
  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.findOne(id);
  }
  @ApiBearerAuth('access-token')
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.EDITOR)
  updateContactStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContactStatusDto) {
    return this.contactService.updateContactStatus(id, dto);
  }
}
