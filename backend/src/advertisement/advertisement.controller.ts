import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto';
import { JwtAuthGuard } from '../auth/guargs/jwt-auth.guard';
import { Public } from '../../libs/common/src/decorators/public.decortor';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAdvertisementDto: CreateAdvertisementDto, @Request() req) {
    return this.advertisementService.create(createAdvertisementDto, req.user.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: any) {
    return this.advertisementService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyAdvertisements(@Request() req) {
    return this.advertisementService.findByUser(req.user.id);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.advertisementService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
    @Request() req,
  ) {
    return this.advertisementService.update(id, updateAdvertisementDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.advertisementService.remove(id, req.user.id);
  }
}
