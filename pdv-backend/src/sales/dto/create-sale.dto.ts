export class CreateSaleItemDto {
  productId: number; // ID do produto
  quantity: number; // Quantidade vendida
}

export class CreateSaleDto {
  items: CreateSaleItemDto[]; // Array de itens da venda
  paymentMethod?: string; // dinheiro, cartao_credito, cartao_debito, pix
}
