import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto) {
    let total = 0;
    const itemsData: {
      productId: number;
      productName: string;
      productCode: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${item.productId} no encontrado`,
        );
      }
      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}". Disponible: ${product.quantity}, solicitado: ${item.quantity}`,
        );
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      itemsData.push({
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal,
      });

      // Deduct stock
      await this.prisma.product.update({
        where: { id: product.id },
        data: { quantity: product.quantity - item.quantity },
      });
    }

    return this.prisma.sale.create({
      data: {
        total,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: { items: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }
    return sale;
  }

  async findByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: { items: true },
      orderBy: { date: 'desc' },
    });
  }
}
