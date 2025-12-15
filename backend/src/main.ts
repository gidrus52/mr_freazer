import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    // app.useGlobalInterceptors();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    await app.listen(port);
    
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📡 API available at: http://localhost:${port}/api`);
    console.log(`🌐 Health check: http://localhost:${port}/api`);
}
bootstrap();
