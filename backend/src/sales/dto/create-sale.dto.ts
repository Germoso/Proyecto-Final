import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber()
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  quantity: number;
}

export class CreateSaleDto {
  @IsArray({ message: 'Los items deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
