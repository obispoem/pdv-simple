export class CreateProductDto {
  name: string;
  price: number;
  cost?: number;
  stock?: number;
  categoryId?: number;
}
