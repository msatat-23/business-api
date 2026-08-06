import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ContactStatusFilter } from '../../../common/enums/contact-status-filter.enum';

export class FindContactsQueryDto {
  @ApiPropertyOptional({
    enum: ContactStatusFilter,
    default: ContactStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(ContactStatusFilter)
  contactStatus?: ContactStatusFilter = ContactStatusFilter.ALL;

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
