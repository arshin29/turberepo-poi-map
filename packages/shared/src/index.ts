/**
 * POI (Point of Interest) Core Data Model
 * 
 * Shared across both backend (NestJS) and frontend (React)
 * to ensure strong type-safety and contract consistency.
 */
export interface Poi {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload required to create a new Point of Interest.
 */
export interface CreatePoiDto {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

/**
 * Payload used to update an existing Point of Interest (all fields optional).
 */
export interface UpdatePoiDto {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/**
 * Initial curated landmarks for seed data and quick map testing
 */
export const INITIAL_SEED_POIS: CreatePoiDto[] = [
  {
    name: 'Eiffel Tower',
    description: 'Iconic 330m-tall wrought-iron lattice tower on the Champ de Mars in Paris, France.',
    latitude: 48.8584,
    longitude: 2.2945
  },
  {
    name: 'Colosseum',
    description: 'Ancient Roman amphitheatre in the centre of Rome, Italy, constructed under the Flavian emperors.',
    latitude: 41.8902,
    longitude: 12.4922
  },
  {
    name: 'Statue of Liberty',
    description: 'Colossal neoclassical copper statue on Liberty Island in New York Harbor, USA.',
    latitude: 40.6892,
    longitude: -74.0445
  },
  {
    name: 'Tokyo Skytree',
    description: 'Broadcasting and observation tower in Sumida, Tokyo, Japan, reaching a height of 634 meters.',
    latitude: 35.7100,
    longitude: 139.8107
  },
  {
    name: 'Sydney Opera House',
    description: 'Multi-venue performing arts centre in Sydney Harbour, New South Wales, Australia.',
    latitude: -33.8568,
    longitude: 151.2153
  },
  {
    name: 'Taj Mahal',
    description: 'Ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, India.',
    latitude: 27.1751,
    longitude: 78.0421
  }
];
