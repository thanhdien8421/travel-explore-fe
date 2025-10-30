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
  average_rating?: number | null;  // Average rating (optional in summary)
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
  average_rating?: number | null;  // Average rating
  visited?: boolean;               // Whether current user has visited (for authenticated users)
  created_at: Date;                // Creation timestamp
  updated_at: Date;                // Last update timestamp
  images: PlaceImage[];            // Array of images
  reviews?: Review[];              // Array of reviews
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

// Auth interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Review interfaces
export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: string;
  created_at?: string;
  user?: {
    full_name: string;
  };
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

// Visit history interfaces
export interface VisitHistory {
  place: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl?: string;
    cover_image_url?: string;
  };
  visitedAt: string;
}

export interface CreateVisitDto {
  placeId: string;
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
      const finalHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      };

      // Debug: Log Authorization header
      if (finalHeaders["Authorization"]) {
        console.log("Authorization header present:", finalHeaders["Authorization"].substring(0, 20) + "...");
      }

      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.message || error.error || `HTTP ${response.status}: ${response.statusText}`;
        
        // Debug 403 errors specifically
        if (response.status === 403) {
          console.error("403 Forbidden - Token issue:", {
            status: response.status,
            message: errorMsg,
            url: url,
            headers: finalHeaders,
          });
        }
        
        throw new Error(errorMsg);
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
  async getPlaceBySlug(slug: string, token?: string): Promise<PlaceDetail> {
    if (!slug) {
      throw new Error('Slug is required');
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.fetchWithError(`${this.baseUrl}/api/places/${slug}`, {
      headers,
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

  // ============ AUTH ENDPOINTS ============
  
  // Register new user
  async register(data: RegisterDto): Promise<AuthResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Login user
  async login(data: LoginDto): Promise<AuthResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============ REVIEW ENDPOINTS ============

  // Create review for a place
  async createReview(placeId: string, data: CreateReviewDto, token: string): Promise<Review> {
    return this.fetchWithError(`${this.baseUrl}/api/places/${placeId}/reviews`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // ============ VISIT HISTORY ENDPOINTS ============

  // Mark place as visited
  async markPlaceVisited(placeId: string, token: string): Promise<{ message: string }> {
    return this.fetchWithError(`${this.baseUrl}/api/me/visits`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ placeId }),
    });
  }

  // Get user's visit history
  async getVisitHistory(token: string): Promise<VisitHistory[]> {
    return this.fetchWithError(`${this.baseUrl}/api/me/visits`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
