import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GadgetCategory } from '@prisma/client';

@Controller('gadgets')
@UseGuards(JwtGuard)
export class GadgetsController {
  constructor(private gadgetsService: GadgetsService) {}

  @Get()
  findAll(
    @Query('search') search = '',
    @Query('category') category?: GadgetCategory,
    @Query('sort') sort?: 'trending' | 'default',
    @Query('limit') limit?: string,
  ) {
    return this.gadgetsService.findAll({ search, category, sort, limit: limit ? parseInt(limit) : 50 });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gadgetsService.findOne(id);
  }
}
