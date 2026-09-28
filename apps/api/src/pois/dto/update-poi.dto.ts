import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { UpdatePoiDto } from '@poi/shared';

/**
 * Data Transfer Object (DTO) for updating an existing POI.
 * All fields are optional since a PATCH request may only modify a subset of properties.
 */
export class UpdatePoiDtoValidation implements UpdatePoiDto {
  @IsString({ message: 'Name must be a text string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Latitude must be a valid floating-point number' })
  @Min(-90, { message: 'Latitude cannot be less than -90 degrees' })
  @Max(90, { message: 'Latitude cannot be greater than 90 degrees' })
  @IsOptional()
  latitude?: number;

  @IsNumber({}, { message: 'Longitude must be a valid floating-point number' })
  @Min(-180, { message: 'Longitude cannot be less than -180 degrees' })
  @Max(180, { message: 'Longitude cannot be greater than 180 degrees' })
  @IsOptional()
  longitude?: number;
}
