import { Injectable } from "@nestjs/common";
import { SalesService } from "../sales/sales.service";
import { CashierService } from "../cashier/cashier.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private salesService: SalesService,
    private cashierService: CashierService,
  ) {}

  async getDashboard() {
    // Executar todas as consultas em paralelo para performance
    const [
      dailyReport,
      paymentReport,
      cashierStatus,
      lowStockProducts,
      lastSales,
    ] = await Promise.all([
      this.salesService.getDailyReport(),
      this.salesService.getPaymentMethodsReport(),
      this.cashierService.getCashierStatus(),
      this.getLowStockProducts(),
      this.getLastSales(5),
    ]);

    return {
      summary: {
        date: dailyReport.date,
        totalSales: dailyReport.totalSales,
        totalOrders: dailyReport.totalOrders,
        totalItemsSold: dailyReport.totalItemsSold,
        isCashierOpen: cashierStatus.isOpen,
      },
      paymentMethods: paymentReport.paymentMethods,
      bestSellingProducts: dailyReport.bestSellingProducts,
      cashierStatus,
      lowStockProducts,
      lastSales,
      updatedAt: new Date().toISOString(),
    };
  }

  private async getLowStockProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: 10, // Estoque menor ou igual a 10
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
      orderBy: {
        stock: "asc", // Menor estoque primeiro
      },
      take: 10, // Apenas os 10 mais críticos
    });

    return products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));
  }

  private async getLastSales(limit: number) {
    const sales = await this.prisma.sale.findMany({
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sales.map((sale) => ({
      id: sale.id,
      total: Number(sale.total),
      paymentMethod: sale.paymentMethod,
      createdAt: sale.createdAt,
      items: sale.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
      })),
    }));
  }
}
