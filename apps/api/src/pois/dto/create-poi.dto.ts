import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreatePoiDto } from '@poi/shared';

/**
 * Data Transfer Object (DTO) for creating a POI.
 * 
 * NestJS uses `class-validator` decorators to automatically validate incoming
 * HTTP request bodies before they reach controller handlers.
 */
export class CreatePoiDtoValidation implements CreatePoiDto {
  @IsString({ message: 'Name must be a text string' })
  @IsNotEmpty({ message: 'POI name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Latitude must be a valid floating-point number' })
  @Min(-90, { message: 'Latitude cannot be less than -90 degrees' })
  @Max(90, { message: 'Latitude cannot be greater than 90 degrees' })
  latitude: number;

  @IsNumber({}, { message: 'Longitude must be a valid floating-point number' })
  @Min(-180, { message: 'Longitude cannot be less than -180 degrees' })
  @Max(180, { message: 'Longitude cannot be greater than 180 degrees' })
  longitude: number;
}
