/**
 * API Service for Travel Explore Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Location {
  id: number;
  name: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  name: string;
  description: string;
  location: string;
  image: string;
  rating?: number;
}

export interface LocationsResponse {
  status: string;
  data: Location[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LocationResponse {
  status: string;
  data: Location;
}

export interface StatisticsResponse {
  status: string;
  data: {
    totalLocations: number;
    averageRating: number;
    highQualityLocations: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchWithError(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "An error occurred");
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get all locations with optional search and filters
  async getLocations(params?: {
    search?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }): Promise<LocationsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minRating) queryParams.append("minRating", params.minRating.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.baseUrl}/locations${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url);
  }

  // Get single location by ID
  async getLocationById(id: number): Promise<LocationResponse> {
    return this.fetchWithError(`${this.baseUrl}/locations/${id}`);
  }

  // Create new location
  async createLocation(data: CreateLocationDto): Promise<LocationResponse> {
    return this.fetchWithError(`${this.baseUrl}/locations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update location
  async updateLocation(id: number, data: Partial<CreateLocationDto>): Promise<LocationResponse> {
    return this.fetchWithError(`${this.baseUrl}/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete location
  async deleteLocation(id: number): Promise<void> {
    return this.fetchWithError(`${this.baseUrl}/locations/${id}`, {
      method: "DELETE",
    });
  }

  // Get statistics (for admin)
  async getStatistics(): Promise<StatisticsResponse> {
    return this.fetchWithError(`${this.baseUrl}/locations/statistics`);
  }
}

export const apiService = new ApiService();
