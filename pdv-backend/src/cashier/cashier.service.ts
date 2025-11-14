import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OpenCashierDto } from "./dto/open-cashier.dto";
import { CloseCashierDto } from "./dto/close-cashier.dto";

@Injectable()
export class CashierService {
  constructor(private prisma: PrismaService) {}

  // VERIFICAR SE O CAIXA JÁ ESTÁ ABERTO
  private async getActiveOperation() {
    const operation = await this.prisma.cashierOperation.findFirst({
      where: { type: "open" },
      orderBy: { createdAt: "desc" },
    });
    return operation;
  }

  // ABRIR CAIXA
  async openCashier(openCashierDto: OpenCashierDto) {
    const activeOperation = await this.getActiveOperation();

    if (activeOperation) {
      throw new ConflictException("Já existe um caixa aberto");
    }

    const operation = await this.prisma.cashierOperation.create({
      data: {
        type: "open",
        amount: openCashierDto.initialBalance,
        openedAt: new Date(),
      },
    });

    return {
      id: operation.id,
      type: operation.type,
      amount: Number(operation.amount),
      openedAt: operation.openedAt,
      createdAt: operation.createdAt,
    };
  }

  // FECHAR CAIXA
  async closeCashier(closeCashierDto: CloseCashierDto) {
    const activeOperation = await this.getActiveOperation();

    if (!activeOperation) {
      throw new NotFoundException("Nenhum caixa aberto encontrado");
    }

    // ✅ CORREÇÃO: Garantir que openedAt não é null
    if (!activeOperation.openedAt) {
      throw new Error("Data de abertura do caixa não encontrada");
    }

    // CALCULAR TOTAL DE VENDAS DESDE A ABERTURA DO CAIXA
    const salesSinceOpen = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: activeOperation.openedAt,
        },
      },
    });

    const totalSales = salesSinceOpen.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    // SALDO ESPERADO NO SISTEMA
    const expectedBalance = Number(activeOperation.amount) + totalSales;

    // DIFERENÇA ENTRE REAL E SISTEMA
    const difference = Number(closeCashierDto.finalBalance) - expectedBalance;

    const operation = await this.prisma.cashierOperation.create({
      data: {
        type: "close",
        amount: closeCashierDto.finalBalance,
        balance: expectedBalance,
        difference: difference,
        openedAt: activeOperation.openedAt,
        closedAt: new Date(),
      },
    });

    return {
      id: operation.id,
      type: operation.type,
      amount: Number(operation.amount),
      balance: Number(operation.balance),
      difference: Number(operation.difference),
      openedAt: operation.openedAt,
      closedAt: operation.closedAt,
      createdAt: operation.createdAt,
    };
  }

  // STATUS DO CAIXA
  async getCashierStatus() {
    const activeOperation = await this.getActiveOperation();

    if (!activeOperation) {
      return { isOpen: false, message: "Caixa fechado" };
    }

    if (!activeOperation.openedAt) {
      throw new Error("Data de abertura do caixa não encontrada");
    }

    // CALCULAR VENDAS DESDE A ABERTURA
    const salesSinceOpen = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: activeOperation.openedAt, // ✅ Agora openedAt não é null
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

    const totalSales = salesSinceOpen.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    const expectedBalance = Number(activeOperation.amount) + totalSales;

    // ✅ CORREÇÃO: Tipagem explícita para os items
    const formattedSales = salesSinceOpen.map((sale) => ({
      id: sale.id,
      total: Number(sale.total),
      createdAt: sale.createdAt,
      items: sale.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    }));

    return {
      isOpen: true,
      openedAt: activeOperation.openedAt,
      initialBalance: Number(activeOperation.amount),
      totalSales: Number(totalSales.toFixed(2)),
      expectedBalance: Number(expectedBalance.toFixed(2)),
      salesCount: salesSinceOpen.length,
      sales: formattedSales, // ✅ Usando a versão tipada
    };
  }

  // HISTÓRICO DE OPERAÇÕES
  async getHistory() {
    const operations = await this.prisma.cashierOperation.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return operations.map((op) => ({
      id: op.id,
      type: op.type,
      amount: Number(op.amount),
      balance: op.balance ? Number(op.balance) : null,
      difference: op.difference ? Number(op.difference) : null,
      openedAt: op.openedAt,
      closedAt: op.closedAt,
      createdAt: op.createdAt,
    }));
  }
}
