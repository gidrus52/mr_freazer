import { Module } from '@nestjs/common';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdvertisementController],
  providers: [AdvertisementService],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
