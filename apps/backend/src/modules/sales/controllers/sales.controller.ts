import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from '../services/sales.service';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post('from-session/:sessionId')
    async createSale(@Request() req: any, @Param('sessionId') sessionId: string) {
        return this.salesService.createSaleFromSession(sessionId, req.user.userId);
    }

    @Get(':id')
    async getSale(@Request() req: any, @Param('id') id: string) {
        return this.salesService.getSale(id, req.user.userId);
    }
}
