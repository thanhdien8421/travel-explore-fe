/**
 * API Service for Travel Explore Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Category interface
export interface Category {
  id: string;                      // UUID
  name: string;                    // Category name (e.g., "Ẩm thực")
  slug: string;                    // URL-friendly slug (e.g., "am-thuc")
}

// Place summary interface (for list views)
export interface PlaceSummary {
  id: string;                      // UUID
  name: string;                    // Place name
  slug: string;                    // URL-friendly identifier
  description?: string | null;     // Short description
  ward: string;                    // Ward/sub-district (new - required)
  district?: string | null;        // District name
  cover_image_url?: string | null; // Main image URL
  is_featured?: boolean;           // Featured flag (optional in summary)
  average_rating?: number | null;  // Average rating (optional in summary)
  latitude?: number | null;        // Latitude coordinate (for map)
  longitude?: number | null;       // Longitude coordinate (for map)
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
  street_address?: string | null;  // Street address (new - replaces address_text)
  ward: string;                    // Ward/sub-district (new - required)
  district?: string | null;        // District name
  province_city?: string | null;   // Province/city (new)
  location_description?: string | null; // Location description (new)
  latitude?: number | null;        // Latitude coordinate
  longitude?: number | null;       // Longitude coordinate
  cover_image_url?: string | null; // Main image URL
  opening_hours?: string | null;   // Opening hours info
  price_info?: string | null;      // Price information
  contact_info?: string | null;    // Contact details
  tips_notes?: string | null;      // Visitor tips
  is_featured: boolean;            // Featured flag
  average_rating?: number | null;  // Average rating
  categories?: Category[];         // Array of categories (new - M2M)
  visited?: boolean;               // Whether current user has visited
  created_at?: Date;               // Creation timestamp
  updated_at?: Date;               // Last update timestamp
  images?: PlaceImage[];           // Array of images
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

// New interface for creating places with the new API (structured address)
export interface CreatePlaceDto {
  name: string;
  description: string;
  streetAddress: string;           // Street address (new - required)
  ward: string;                    // Ward/sub-district (new - required)
  district?: string;               // District name
  provinceCity?: string;           // Province/city
  locationDescription?: string;    // Location description
  coverImageUrl: string;           // Cover image URL
  latitude?: number;               // Latitude (optional - backend can geocode)
  longitude?: number;              // Longitude (optional - backend can geocode)
  categoryIds: string[];           // Category IDs (new - M2M)
  openingHours?: string;           // Opening hours
  priceInfo?: string;              // Price info
  contactInfo?: string;            // Contact info
  tipsNotes?: string;              // Tips/notes
  isFeatured?: boolean;            // Featured flag (default: false)
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

export interface PlacesResponse {
  data: PlaceSummary[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CategoriesResponse {
  data: Category[];
}

export interface WardsResponse {
  data: string[];
}

export interface AdminPlacesResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    district: string | null;
    ward: string;
    coverImageUrl: string | null;
    isFeatured: boolean;
    averageRating: number;
    categories: Array<{ categoryId: string; category: { id: string; name: string } }>;
    createdAt: string;
  }>;
  pagination: {
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

  // Search places with advanced filters (new API)
  async searchPlaces(params?: {
    q?: string;                     // Search query
    category?: string;              // Category slug filter
    ward?: string;                  // Ward filter
    district?: string;              // District filter
    sortBy?: string;                // Sort: name_asc, name_desc, rating_asc, rating_desc
    limit?: number;                 // Items per page (default 10)
    page?: number;                  // Page number (default 1)
    featured?: boolean;             // Featured places only
  }): Promise<PlacesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.q) queryParams.append("q", params.q);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.ward) queryParams.append("ward", params.ward);
    if (params?.district) queryParams.append("district", params.district);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.featured !== undefined) queryParams.append("featured", params.featured.toString());

    const url = `${this.baseUrl}/api/places${queryParams.toString() ? `?${queryParams}` : ""}`;
    const result = await this.fetchWithError(url);
    return result as PlacesResponse;
  }

  // Get places list with optional featured filter (legacy)
  async getPlaces(params?: {
    featured?: boolean;
    limit?: number;
  }): Promise<PlaceSummary[]> {
    const response = await this.searchPlaces({
      featured: params?.featured,
      limit: params?.limit || 10,
    });
    return response.data;
  }

  // Get featured places (convenience method)
  async getFeaturedPlaces(limit: number = 8): Promise<PlaceSummary[]> {
    return this.getPlaces({ featured: true, limit });
  }

  // Get all places (convenience method)
  async getAllPlaces(limit: number = 10): Promise<PlaceSummary[]> {
    return this.getPlaces({ limit });
  }

  // Get all categories (new)
  async getCategories(): Promise<Category[]> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/categories`) as CategoriesResponse;
    return response.data;
  }

  // Get all wards (new)
  async getWards(): Promise<string[]> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/wards`) as WardsResponse;
    return response.data;
  }

  // Search locations by query (legacy - for backward compatibility)
  async getLocations(params?: {
    search?: string;
    limit?: number;
  }): Promise<{ data: Location[] }> {
    const result = await this.searchPlaces({
      q: params?.search,
      limit: params?.limit || 10,
    });
    
    // Transform PlaceSummary to Location for backward compatibility
    const locations: Location[] = (result.data || []).map((place: PlaceSummary) => ({
      ...place,
      location: place.district || "",
      image: place.cover_image_url || "",
      rating: place.average_rating || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    return { data: locations };
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

  // Create new place with new API (with structured address & categories)
  async createPlace(data: CreatePlaceDto, token: string): Promise<PlaceDetail> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/admin/places`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  // Update place (new)
  async updatePlace(id: string, data: Partial<CreatePlaceDto>, token: string): Promise<PlaceDetail> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  // Delete place (soft delete - new)
  async deletePlace(id: string, token: string): Promise<void> {
    await this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Get admin places with pagination, sorting, and filtering
  async getAdminPlaces(params?: {
    search?: string;
    category?: string;
    ward?: string;
    sortBy?: "name" | "createdAt" | "featured";
    sortOrder?: "asc" | "desc";
    limit?: number;
    page?: number;
  }, token?: string): Promise<AdminPlacesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.ward) queryParams.append("ward", params.ward);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/admin/places${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers }) as Promise<AdminPlacesResponse>;
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
