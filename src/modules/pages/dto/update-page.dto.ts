import { IsObject, IsOptional } from 'class-validator';

export class UpdatePageDto {
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}
