import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionService } from './services/session.service';
import { SessionController } from './controllers/session.controller';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Session]),
        CatalogModule,
    ],
    controllers: [SessionController],
    providers: [SessionService],
    exports: [SessionService],
})
export class SessionModule { }
