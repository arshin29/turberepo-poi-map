import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PoisService } from './pois.service';
import { CreatePoiDtoValidation } from './dto/create-poi.dto';
import { UpdatePoiDtoValidation } from './dto/update-poi.dto';
import { PoiEntity } from './poi.entity';

/**
 * PoisController exposes REST API endpoints for Points of Interest (POI).
 *
 * Route prefix: /pois
 * NestJS maps HTTP methods directly to annotated member functions.
 */
@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  /**
   * GET /pois
   * Returns an array of all Points of Interest.
   */
  @Get()
  async findAll(): Promise<PoiEntity[]> {
    return this.poisService.findAll();
  }

  /**
   * GET /pois/:id
   * Returns details for a single POI or 404 if not found.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PoiEntity> {
    return this.poisService.findOne(id);
  }

  /**
   * POST /pois
   * Creates a new POI after validating payload against CreatePoiDtoValidation.
   * Responds with HTTP 201 Created.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPoiDto: CreatePoiDtoValidation): Promise<PoiEntity> {
    return this.poisService.create(createPoiDto);
  }

  /**
   * PATCH /pois/:id
   * Partially updates an existing POI.
   * Coordinates, name, and description can be updated independently.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePoiDto: UpdatePoiDtoValidation,
  ): Promise<PoiEntity> {
    return this.poisService.update(id, updatePoiDto);
  }

  /**
   * DELETE /pois/:id
   * Removes a POI by ID and returns a success confirmation.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.poisService.remove(id);
  }
}
