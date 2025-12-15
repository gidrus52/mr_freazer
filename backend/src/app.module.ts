import { JwtAuthGuard } from '@auth/guargs/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ImageModule } from './image/image.module';
import { UserModule } from './user/user.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { MessageModule } from './message/message.module';
import { OrderModule } from './order/order.module';

@Module({
    imports: [
        UserModule, 
        PrismaModule, 
        AuthModule, 
        CategoryModule, 
        ProductModule, 
        ImageModule, 
        AdvertisementModule,
        MessageModule,
        OrderModule,
        ConfigModule.forRoot({ isGlobal: true })
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
