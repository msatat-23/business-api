import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateContactStatusDto {
  @IsNotEmpty()
  @IsString()
  contactStatus: string;
}
