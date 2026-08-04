import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+\-\s()]{6,30}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  jobTitle: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
