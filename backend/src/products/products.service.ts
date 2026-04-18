import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { code: dto.code },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un producto con el código "${dto.code}"`,
      );
    }
    return this.prisma.product.create({ data: dto });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async search(query: string) {
    if (!query || query.trim() === '') {
      return this.findAll();
    }
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id); // throws if not found
    if (dto.code) {
      const exists = await this.prisma.product.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (exists) {
        throw new ConflictException(
          `Ya existe un producto con el código "${dto.code}"`,
        );
      }
    }
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
