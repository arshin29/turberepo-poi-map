import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoisService } from './pois.service';
import { PoisController } from './pois.controller';
import { PoiEntity } from './poi.entity';

/**
 * PoisModule encapsulates the POI feature domain.
 * 
 * - imports: registers the PoiEntity with TypeORM so Repository<PoiEntity> can be injected.
 * - controllers: registers the PoisController to handle incoming HTTP requests.
 * - providers: registers the PoisService to handle data operations and business rules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PoiEntity])],
  controllers: [PoisController],
  providers: [PoisService],
  exports: [PoisService],
})
export class PoisModule {}
