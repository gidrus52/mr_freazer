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
import { MessageService } from './message.service';
import { CreateMessageDto, UpdateMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guargs/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messageService.create(createMessageDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: any, @Request() req) {
    return this.messageService.findAll(req.user.id, query);
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.messageService.getConversations(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.messageService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req,
  ) {
    return this.messageService.update(id, updateMessageDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.messageService.remove(id, req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.messageService.markAsRead(id, req.user.id);
  }
}
