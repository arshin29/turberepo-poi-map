import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiRoot() {
    return {
      status: 'online',
      name: 'GeoPoint POI — NestJS REST API',
      message: 'API is running successfully with SQLite and TypeORM.',
      endpoints: {
        listAllPois: 'GET /pois',
        getPoiById: 'GET /pois/:id',
        createPoi: 'POST /pois',
        updatePoi: 'PATCH /pois/:id',
        deletePoi: 'DELETE /pois/:id',
      },
      frontendApp: 'http://localhost:5173',
    };
  }
}
