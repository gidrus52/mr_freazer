import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreateAdvertisementDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
