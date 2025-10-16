/**
 * API Service for Travel Explore Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Place summary interface (for list views)
export interface PlaceSummary {
  id: string;                      // UUID
  name: string;                    // Place name
  slug: string;                    // URL-friendly identifier
  description: string | null;      // Short description
  district: string | null;         // District name
  cover_image_url: string | null;  // Main image URL
  is_featured?: boolean;           // Featured flag (optional in summary)
}

// Place image interface
export interface PlaceImage {
  id: string;                      // UUID
  image_url: string;               // Image URL
  caption?: string | null;         // Image caption
}

// Place detail interface (for detail views)
export interface PlaceDetail {
  id: string;                      // UUID
  name: string;                    // Place name
  slug: string;                    // URL-friendly identifier
  description?: string | null;     // Full description
  address_text?: string | null;    // Full address
  district?: string | null;        // District name
  city?: string | null;            // City name
  latitude?: number | null;        // Latitude coordinate
  longitude?: number | null;       // Longitude coordinate
  cover_image_url?: string | null; // Main image URL
  opening_hours?: string | null;   // Opening hours info
  price_info?: string | null;      // Price information
  contact_info?: string | null;    // Contact details
  tips_notes?: string | null;      // Visitor tips
  is_featured: boolean;            // Featured flag
  created_at: Date;                // Creation timestamp
  updated_at: Date;                // Last update timestamp
  images: PlaceImage[];            // Array of images
}

// Legacy interfaces for backward compatibility
export interface Location extends PlaceSummary {
  location: string;                // For backward compatibility
  image: string;                   // For backward compatibility
  rating: number;                  // For backward compatibility
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

// New interface for creating places with the new API
export interface CreatePlaceDto {
  name: string;
  description: string;
  addressText: string;              // camelCase to match backend
  coverImageUrl: string;            // camelCase to match backend
  district?: string;
  city?: string;
  latitude?: number;                // Optional - if provided, skip geocoding
  longitude?: number;               // Optional - if provided, skip geocoding
  openingHours?: string;            // camelCase to match backend
  priceInfo?: string;               // camelCase to match backend
  contactInfo?: string;             // camelCase to match backend
  tipsNotes?: string;               // camelCase to match backend
  isFeatured?: boolean;             // camelCase to match backend (default: false)
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

  // Get places list with optional featured filter
  async getPlaces(params?: {
    featured?: boolean;
    limit?: number;
  }): Promise<PlaceSummary[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.featured !== undefined) queryParams.append("featured", params.featured.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.baseUrl}/api/places${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url);
  }

  // Get featured places (convenience method)
  async getFeaturedPlaces(limit: number = 8): Promise<PlaceSummary[]> {
    return this.getPlaces({ featured: true, limit });
  }

  // Get all places (convenience method)
  async getAllPlaces(limit: number = 10): Promise<PlaceSummary[]> {
    return this.getPlaces({ limit });
  }

  // Get place details by slug
  async getPlaceBySlug(slug: string): Promise<PlaceDetail> {
    if (!slug) {
      throw new Error('Slug is required');
    }
    return this.fetchWithError(`${this.baseUrl}/api/places/${slug}`);
  }

  // Legacy methods for backward compatibility
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

    const url = `${this.baseUrl}/api/locations${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url);
  }

  // Get single location by ID (legacy)
  async getLocationById(id: number): Promise<LocationResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/locations/${id}`);
  }

  // Create new location (legacy)
  async createLocation(data: CreateLocationDto): Promise<LocationResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/locations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Create new place with new API (with OpenStreetMap integration)
  async createPlace(data: CreatePlaceDto): Promise<PlaceDetail> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/admin/places`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  // Update location (legacy)
  async updateLocation(id: number, data: Partial<CreateLocationDto>): Promise<LocationResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete location (legacy)
  async deleteLocation(id: number): Promise<void> {
    return this.fetchWithError(`${this.baseUrl}/api/locations/${id}`, {
      method: "DELETE",
    });
  }

  // Get statistics (legacy)
  async getStatistics(): Promise<StatisticsResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/locations/statistics`);
  }
}

export const apiService = new ApiService();
