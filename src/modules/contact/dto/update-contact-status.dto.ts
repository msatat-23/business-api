import { IsEnum, IsNotEmpty } from 'class-validator';
import { ContactStatus } from '../../../common/enums/contact-status.enum';

export class UpdateContactStatusDto {
  @IsNotEmpty()
  @IsEnum(ContactStatus)
  contactStatus: ContactStatus;
}
