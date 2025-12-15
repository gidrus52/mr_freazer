import { JwtPayload } from '@auth/interfaces';
import { CurrentUser, Roles } from '@common/decorators';
import {
    Req,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Put,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@auth/guargs/role.guard';
import { JwtAuthGuard } from '@auth/guargs/jwt-auth.guard';
import { Role } from '@prisma/client';
import { User } from '@prisma/client';
import { UserResponse } from './responses';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async findOneUser(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.userService.findOne(idOrEmail);
        return new UserResponse(user);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
        return this.userService.delete(id, user);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async findAllUsers() {
        const users = await this.userService.findAll();
        return users.map(user => new UserResponse(user));
    }
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user: JwtPayload) {
        const fullUser = await this.userService.findOne(user.id);
        return new UserResponse(fullUser);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Put()
    async updateUser(@Body() body: Partial<User>) {
        const user = await this.userService.save(body);
        return new UserResponse(user);
    }
}
