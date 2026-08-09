import { IsObject, IsOptional } from 'class-validator';

export class UpdateContentDto {
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}
