import { Poi, CreatePoiDto, UpdatePoiDto } from '@poi/shared';

// Base API URL: default to empty string so requests leverage Vite's dev proxy to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

/**
 * Custom error class for API failures containing HTTP status and payload
 */
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic helper to handle fetch requests and throw typed errors
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (Array.isArray(errorJson.message)) {
          errorMessage = errorJson.message.join(', ');
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Fallback to response.statusText if body is not JSON
      }
      throw new ApiError(response.status, errorMessage);
    }

    // For 204 No Content or empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network error';
    const target = API_BASE_URL || 'http://localhost:3001';
    throw new ApiError(0, `Cannot connect to API server at ${target}. Ensure NestJS is running. (${message})`);
  }
}

/**
 * Service methods for all POI REST endpoints:
 * - GET    /pois
 * - GET    /pois/:id
 * - POST   /pois
 * - PATCH  /pois/:id
 * - DELETE /pois/:id
 */
export const poiApi = {
  /**
   * Fetch all points of interest
   */
  async getAll(): Promise<Poi[]> {
    return request<Poi[]>('/pois');
  },

  /**
   * Fetch a single point of interest by ID
   */
  async getById(id: string): Promise<Poi> {
    return request<Poi>(`/pois/${id}`);
  },

  /**
   * Create a new point of interest
   */
  async create(data: CreatePoiDto): Promise<Poi> {
    return request<Poi>('/pois', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing point of interest
   */
  async update(id: string, data: UpdatePoiDto): Promise<Poi> {
    return request<Poi>(`/pois/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a point of interest
   */
  async delete(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    return request<{ success: boolean; message: string; deletedId: string }>(`/pois/${id}`, {
      method: 'DELETE',
    });
  },
};
