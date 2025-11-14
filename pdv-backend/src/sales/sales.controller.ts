import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Get("reports/daily")
  getDailyReport(@Query("date") date?: string) {
    return this.salesService.getDailyReport(date);
  }

  @Get("reports/payment-methods")
  getPaymentMethodsReport(@Query("date") date?: string) {
    return this.salesService.getPaymentMethodsReport(date);
  }
}
