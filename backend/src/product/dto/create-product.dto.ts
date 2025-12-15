import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;


} 