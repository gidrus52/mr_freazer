import { JwtPayload } from '@auth/interfaces';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User, Role } from '@prisma/client';
import { UserService } from '@user/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(private readonly configService: ConfigService, private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
        this.logger.log('JwtStrategy constructor called');
        this.logger.log('JWT_SECRET configured:', !!this.configService.get('JWT_SECRET'));
    }

    async validate(payload: JwtPayload) {
        this.logger.log('JwtStrategy.validate called with payload:', payload);
        
        try {
            const user: User = await this.userService.findOne(payload.id, false, false);
            this.logger.log('User found:', user);
            this.logger.log('User roles:', user?.roles, typeof user?.roles);
            
            if (!user || user.isBlocked) {
                this.logger.error('User not found or blocked');
                throw new UnauthorizedException();
            }
            
            // Гарантируем, что roles всегда массив
            let roles: Role[] = [];
            if (Array.isArray(user.roles)) {
                roles = user.roles;
            }
            
            this.logger.log('Processed roles:', roles);
            
            // Возвращаем полноценного пользователя
            const result = {
                ...user,
                roles,
            };
            
            this.logger.log('JwtStrategy returning:', result);
            return result;
        } catch (error) {
            this.logger.error('Error in validate:', error);
            throw new UnauthorizedException();
        }
    }

    // Добавляем метод для логирования процесса извлечения токена
    extractJwtFromRequest(req: any): string | null {
        const authHeader = req.headers.authorization;
        this.logger.log('Extracting JWT from request, auth header:', authHeader);
        
        if (!authHeader) {
            this.logger.log('No Authorization header found');
            return null;
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            this.logger.log('Authorization header does not start with Bearer');
            return null;
        }
        
        const token = authHeader.substring(7);
        this.logger.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'null');
        return token;
    }
}
