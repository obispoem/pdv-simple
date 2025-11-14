import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProductsModule } from "./products/products.module";
import { SalesModule } from "./sales/sales.module";
import { CashierModule } from "./cashier/cashier.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { PrismaService } from "./prisma/prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    SalesModule,
    CashierModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
