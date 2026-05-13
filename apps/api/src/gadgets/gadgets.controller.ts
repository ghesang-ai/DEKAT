import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GadgetCategory } from '@prisma/client';

@Controller('gadgets')
@UseGuards(JwtGuard)
export class GadgetsController {
  constructor(private gadgetsService: GadgetsService) {}

  @Get()
  findAll(@Query('search') search = '', @Query('category') category?: GadgetCategory) {
    return this.gadgetsService.findAll({ search, category });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gadgetsService.findOne(id);
  }
}
