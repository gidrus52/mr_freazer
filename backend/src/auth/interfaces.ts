import { Token, Role } from '@prisma/client';

export interface Tokens {
    accessToken: string;
    refreshToken: Token;
    user: {
        id: string;
        email: string;
        roles: Role[];
    };
}

export interface JwtPayload {
    id: string;
    email: string;
    roles: string[];
}
