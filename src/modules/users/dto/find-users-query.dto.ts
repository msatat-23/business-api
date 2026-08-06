import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserRoleFilter } from '../../../common/enums/user-role-filter.enum';
import { UserStatusFilter } from '../../../common/enums/user-status-filter.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindUsersQueryDto {
  @ApiPropertyOptional({
    enum: UserStatusFilter,
    default: UserStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter = UserStatusFilter.ALL;

  @ApiPropertyOptional({
    enum: UserRoleFilter,
    default: UserRoleFilter.ALL,
  })
  @IsOptional()
  @IsEnum(UserRoleFilter)
  role?: UserRoleFilter = UserRoleFilter.ALL;

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
