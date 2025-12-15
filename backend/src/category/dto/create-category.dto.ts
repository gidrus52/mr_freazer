import { IsString, IsOptional, IsBoolean, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  parentId?: string;
} 