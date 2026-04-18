import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  getReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Debe proporcionar fecha de inicio y fecha de fin',
      );
    }
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('pdf')
  async downloadPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: any,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Debe proporcionar fecha de inicio y fecha de fin',
      );
    }

    const buffer = await this.reportsService.generatePdf(startDate, endDate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=reporte_ventas_${startDate}_${endDate}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
