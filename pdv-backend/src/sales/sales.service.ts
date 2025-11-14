import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSaleDto } from "./dto/create-sale.dto";

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    // PASSO 1: Validar produtos e calcular total
    let total = 0;

    // Definir explicitamente o tipo do array
    const saleItemsData: Array<{
      productId: number;
      quantity: number;
      price: number;
    }> = [];

    for (const item of createSaleDto.items) {
      // Buscar produto no banco
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId, isActive: true },
      });

      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${item.productId} não encontrado`,
        );
      }

      // ✅ CORREÇÃO: Acessar stock com segurança
      const productStock = Number(product.stock);
      if (productStock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto ${product.name}`);
      }

      // Converter Decimal para number
      const productPrice = Number(product.price);
      const itemTotal = productPrice * item.quantity;
      total += itemTotal;

      // Preparar dados para criar o SaleItem
      saleItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: productPrice,
      });
    }

    // PASSO 2: Usar TRANSACTION
    return await this.prisma.$transaction(async (prisma) => {
      // 2A: Criar a venda
      const sale = await prisma.sale.create({
        data: {
          total,
          paymentMethod: createSaleDto.paymentMethod || "dinheiro", // ← USAR O MÉTODO DE PAGAMENTO
          items: {
            create: saleItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      // 2B: Atualizar estoque de CADA produto
      for (const item of createSaleDto.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });
  }

  async getDailyReport(date?: string) {
    // Se não fornecer data, usa hoje
    const targetDate = date ? new Date(date) : new Date();

    // Define início e fim do dia
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Busca vendas do dia
    const dailySales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Cálculos com tipagem segura
    const totalSales = dailySales.reduce(
      (sum: number, sale) => sum + Number(sale.total),
      0,
    );

    const totalItemsSold = dailySales.reduce(
      (sum: number, sale) =>
        sum +
        sale.items.reduce(
          (itemSum: number, item) => itemSum + item.quantity,
          0,
        ),
      0,
    );

    // Produtos mais vendidos do dia com tipagem
    interface ProductSales {
      [key: string]: {
        product: any;
        quantity: number;
        total: number;
      };
    }

    const productSales: ProductSales = {};

    dailySales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.productId.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.product,
            quantity: 0,
            total: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].total += Number(item.price) * item.quantity;
      });
    });

    const bestSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      date: startOfDay.toISOString().split("T")[0],
      totalSales: Number(totalSales.toFixed(2)),
      totalOrders: dailySales.length,
      totalItemsSold,
      bestSellingProducts,
      sales: dailySales,
    };
  }

  async findAll() {
    // ✅ CORREÇÃO: Adicionar await
    const sales = await this.prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sales;
  }

  async getPaymentMethodsReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailySales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        paymentMethod: true,
        total: true,
      },
    });

    // Agrupar por forma de pagamento
    const paymentSummary = dailySales.reduce(
      (acc, sale) => {
        const method = sale.paymentMethod;
        if (!acc[method]) {
          acc[method] = { total: 0, count: 0 };
        }
        acc[method].total += Number(sale.total);
        acc[method].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    return {
      date: startOfDay.toISOString().split("T")[0],
      totalSales: dailySales.reduce((sum, sale) => sum + Number(sale.total), 0),
      totalOrders: dailySales.length,
      paymentMethods: Object.entries(paymentSummary).map(([method, data]) => ({
        method,
        total: Number(data.total.toFixed(2)),
        count: data.count,
        percentage: Number(
          (
            (data.total /
              dailySales.reduce((sum, sale) => sum + Number(sale.total), 0)) *
            100
          ).toFixed(1),
        ),
      })),
    };
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }

    return sale;
  }
}
