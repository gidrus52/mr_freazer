import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateImageDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  data?: string; // Base64 данные

  @IsOptional()
  @IsString()
  @MaxLength(10)
  type?: string; // jpeg, png, gif, etc.

  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
