import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ErpModule } from './modules/erp/erp.module';
import { CommonModule } from './modules/common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { BiometryModule } from './modules/biometry/biometry.module';
import { SessionModule } from './modules/session/session.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                configService.get('database') || {},
        }),
        CommonModule,
        CatalogModule,
        ErpModule,
        AuthModule,
        BiometryModule,
        SessionModule,
        SalesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
