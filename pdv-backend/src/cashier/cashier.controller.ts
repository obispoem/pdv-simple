import { Controller, Get, Post, Body } from "@nestjs/common";
import { CashierService } from "./cashier.service";
import { OpenCashierDto } from "./dto/open-cashier.dto";
import { CloseCashierDto } from "./dto/close-cashier.dto";

@Controller("cashier")
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Post("open")
  openCashier(@Body() openCashierDto: OpenCashierDto) {
    return this.cashierService.openCashier(openCashierDto);
  }

  @Post("close")
  closeCashier(@Body() closeCashierDto: CloseCashierDto) {
    return this.cashierService.closeCashier(closeCashierDto);
  }

  @Get("status")
  getCashierStatus() {
    return this.cashierService.getCashierStatus();
  }

  @Get("history")
  getHistory() {
    return this.cashierService.getHistory();
  }
}
