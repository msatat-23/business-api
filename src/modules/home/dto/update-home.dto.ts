import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UpdateHomeDto {
  @IsOptional()
  @IsObject()
  site?: Record<string, any>;

  @IsOptional()
  @IsObject()
  heroSection?: Record<string, any>;

  @IsOptional()
  @IsObject()
  heroDashboard?: Record<string, any>;

  @IsOptional()
  @IsObject()
  chartData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  navigation?: any[];

  @IsOptional()
  @IsArray()
  services?: any[];

  @IsOptional()
  @IsArray()
  capabilities?: any[];

  @IsOptional()
  @IsArray()
  methodology?: any[];

  @IsOptional()
  @IsArray()
  roadmap?: any[];

  @IsOptional()
  @IsArray()
  portfolio?: any[];

  @IsOptional()
  @IsArray()
  sectorPlaybooks?: any[];
}
