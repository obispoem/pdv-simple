import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { SalesService } from "../sales/sales.service";
import { CashierService } from "../cashier/cashier.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, SalesService, CashierService, PrismaService],
})
export class DashboardModule {}
