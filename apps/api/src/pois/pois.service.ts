import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoiEntity } from './poi.entity';
import { CreatePoiDtoValidation } from './dto/create-poi.dto';
import { UpdatePoiDtoValidation } from './dto/update-poi.dto';
import { INITIAL_SEED_POIS } from '@poi/shared';

/**
 * PoisService handles all business logic and database interactions
 * with SQLite via the TypeORM Repository pattern.
 */
@Injectable()
export class PoisService implements OnModuleInit {
  private readonly logger = new Logger(PoisService.name);

  constructor(
    @InjectRepository(PoiEntity)
    private readonly poiRepository: Repository<PoiEntity>,
  ) {}

  /**
   * On application startup, seed initial sample POIs if the SQLite database is empty.
   * This provides an immediate, engaging experience on the Leaflet map.
   */
  async onModuleInit(): Promise<void> {
    const count = await this.poiRepository.count();
    if (count === 0) {
      this.logger.log('Database empty: Seeding initial Points of Interest...');
      for (const item of INITIAL_SEED_POIS) {
        const poi = this.poiRepository.create(item);
        await this.poiRepository.save(poi);
      }
      this.logger.log(`Successfully seeded ${INITIAL_SEED_POIS.length} landmarks into SQLite.`);
    }
  }

  /**
   * Retrieve all POIs, sorted with the most recently updated/created first.
   */
  async findAll(): Promise<PoiEntity[]> {
    return this.poiRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Retrieve a single POI by its unique ID.
   * Throws a 404 NotFoundException if the record does not exist.
   */
  async findOne(id: string): Promise<PoiEntity> {
    const poi = await this.poiRepository.findOne({ where: { id } });
    if (!poi) {
      throw new NotFoundException(`Point of Interest with ID "${id}" was not found.`);
    }
    return poi;
  }

  /**
   * Create a new POI and persist it to SQLite.
   */
  async create(createPoiDto: CreatePoiDtoValidation): Promise<PoiEntity> {
    const newPoi = this.poiRepository.create(createPoiDto);
    return this.poiRepository.save(newPoi);
  }

  /**
   * Update an existing POI by ID with partial fields.
   */
  async update(id: string, updatePoiDto: UpdatePoiDtoValidation): Promise<PoiEntity> {
    const existing = await this.findOne(id);
    const updated = this.poiRepository.merge(existing, updatePoiDto);
    return this.poiRepository.save(updated);
  }

  /**
   * Delete a POI from the SQLite database.
   */
  async remove(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const poi = await this.findOne(id);
    await this.poiRepository.remove(poi);
    return {
      success: true,
      message: `Point of Interest "${poi.name}" successfully deleted.`,
      deletedId: id,
    };
  }
}
