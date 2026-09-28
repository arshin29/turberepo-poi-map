import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * NestJS Application Entry Point
 *
 * Bootstraps the HTTP server, configures CORS, and registers
 * validation pipes for incoming HTTP payloads.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend (running on a different port, e.g. 5173)
  // can make requests to this NestJS API without cross-origin blocks.
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Enable global ValidationPipe.
  // - whitelist: strips away any properties not defined in the DTO
  // - transform: automatically converts payloads into instances of the DTO class
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 NestJS POI API Server is running on: http://localhost:${port}`);
  logger.log(`📍 POI Endpoint: http://localhost:${port}/pois`);
}

bootstrap();
