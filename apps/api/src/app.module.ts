import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { PoisModule } from './pois/pois.module';
import { PoiEntity } from './pois/poi.entity';
import * as path from 'path';

/**
 * AppModule is the root module of the NestJS application.
 *
 * Configures:
 * 1. TypeORM with SQLite:
 *    - Automatically creates the SQLite database file if it does not exist.
 *    - `synchronize: true` ensures the database tables reflect our TypeScript entities.
 * 2. PoisModule:
 *    - Houses the REST endpoints and business logic for Points of Interest.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.resolve(__dirname, '..', 'poi.sqlite'),
      entities: [PoiEntity],
      synchronize: true, // Automatically synchronize schema on app start
      logging: false,
    }),
    PoisModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
