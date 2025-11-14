import { Module } from "@nestjs/common";
import { CashierService } from "./cashier.service";
import { CashierController } from "./cashier.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [CashierController],
  providers: [CashierService, PrismaService],
})
export class CashierModule {}
