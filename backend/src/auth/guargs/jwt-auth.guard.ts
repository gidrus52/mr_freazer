import { isPublic } from '@common/decorators';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
    private readonly logger = new Logger(JwtAuthGuard.name);
    
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const _isPublic = isPublic(ctx, this.reflector);
        this.logger.log(`JwtAuthGuard.canActivate called, isPublic: ${_isPublic}`);
        
        // Добавляем логирование заголовков для отладки
        const request = ctx.switchToHttp().getRequest();
        this.logger.log('Request headers:', request.headers);
        this.logger.log('Authorization header:', request.headers.authorization);
        this.logger.log('Request URL:', request.url);
        this.logger.log('Request method:', request.method);
        
        if (_isPublic) {
            this.logger.log('Public endpoint, allowing access');
            return true;
        }
        
        this.logger.log('Protected endpoint, calling super.canActivate');
        return super.canActivate(ctx);
    }
}
