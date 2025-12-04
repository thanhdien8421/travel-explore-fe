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
  categories?: Array<{             // Place categories
    id: string;
    name: string;
    slug: string;
  }>;
  images?: PlaceImage[];          // Place images array with is_cover flag
}

// Place image interface
export interface PlaceImage {
  id: string;                      // UUID
  image_url: string;               // Image URL
  caption?: string | null;         // Image caption
  is_cover: boolean;               // Whether this is the cover image
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
  summary?: string | null;         // AI-generated summary from reviews
  is_featured: boolean;            // Featured flag
  average_rating?: number | null;  // Average rating
  categories?: Category[];         // Array of categories (new - M2M)
  visited?: boolean;               // Whether current user has visited
  created_at?: Date;               // Creation timestamp
  updated_at?: Date;               // Last update timestamp
  images?: PlaceImage[];           // Array of images
  reviews?: Review[];              // Array of reviews
}

// ==================== TRAVEL PLAN TYPES ====================

// Travel plan (list view)
export interface TravelPlan {
  id: string;
  name: string;
  item_count: number;
  created_at: string;
}

// Place in travel plan item
export interface TravelPlanItemPlace {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  ward?: string;
  average_rating?: number;
}

// Travel plan item
export interface TravelPlanItem {
  added_at: string;
  order: number;
  place: TravelPlanItemPlace;
}

// Travel plan detail (with items)
export interface TravelPlanDetail {
  id: string;
  name: string;
  created_at?: string;
  items: TravelPlanItem[];
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
  isActive?: boolean;              // Active status (for restore/soft delete)
}

// Auth interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN" | "PARTNER" | "CONTRIBUTOR";
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
    images?: PlaceImage[];
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
    isActive: boolean;
    averageRating: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    categories: Array<{ categoryId: string; category: { id: string; name: string } }>;
    createdAt: string;
    images?: PlaceImage[];
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStats {
  totalLocations: number;
  averageRating: number;
  highQualityLocations: number;
  ratedCount: number;
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

// ==================== BOOKING TYPES ====================

export interface Booking {
  id: string;
  placeId: string;
  userId: string;
  bookingDate: string;
  guestCount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  note?: string | null;
  createdAt: string;
  place?: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl?: string | null;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface BookingsResponse {
  data: Booking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== PARTNER TYPES ====================

export interface PartnerLead {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface PartnerLeadsResponse {
  data: PartnerLead[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== USER MANAGEMENT TYPES ====================

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "USER" | "PARTNER" | "CONTRIBUTOR";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    ADMIN: number;
    USER: number;
    PARTNER: number;
    CONTRIBUTOR: number;
  };
}

// ==================== GENERIC RESPONSE TYPES ====================

export interface MessageResponse {
  message: string;
}

export interface CreateTravelPlanResponse {
  id: string;
  name: string;
  created_at: string;
}

export interface AddPlanItemResponse {
  item?: {
    added_at: string;
    order: number;
    place: TravelPlanItemPlace;
  };
}

// Place with status (for admin/partner/contributor views)
export interface PlaceWithStatus extends PlaceDetail {
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// Pending place for approvals
export interface PendingPlace {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  district: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  images?: PlaceImage[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Handle token expiration - logout and redirect to home
  private handleTokenExpired() {
    if (typeof window !== "undefined") {
      console.log("Token expired - logging out and redirecting to home");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
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
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          console.error("401 Unauthorized - Token expired or invalid");
          this.handleTokenExpired();
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        
        // Handle 403 Forbidden with Authorization header - likely token issue
        if (response.status === 403 && finalHeaders["Authorization"]) {
          console.error("403 Forbidden - Token issue:", {
            status: response.status,
            message: errorMsg,
            url: url,
          });
          this.handleTokenExpired();
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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

  // AI-powered natural language search for places
  async searchWithAI(params: {
    query: string;                  // Natural language search query
    limit?: number;                 // Max results (default 3)
  }): Promise<PlacesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("query", params.query);
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.baseUrl}/api/places/search-ai?${queryParams}`;
    const result = await this.fetchWithError(url);
    return result as PlacesResponse;
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
    q?: string;
    category?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: Location[]; total: number }> {
    const result = await this.searchPlaces({
      q: params?.search || params?.q,
      category: params?.category,
      sortBy: params?.sortBy,
      limit: params?.limit || 12,
      page: params?.page || 1,
    });
    
    // Transform PlaceSummary to Location for backward compatibility
    const locations: Location[] = (result.data || []).map((place: PlaceSummary) => ({
      ...place,
      location: place.ward || "",
      image: place.cover_image_url || "",
      rating: place.average_rating || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    const total = result.pagination?.totalItems || 0;
    return { data: locations, total };
  }

  // Get place details by ID (for admin edit)
  async getPlaceById(id: string, token?: string): Promise<PlaceDetail> {
    if (!id) {
      throw new Error('ID is required');
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}`, {
      headers,
    });
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

  // Fetch reviews for a place (lazy load)
  async getPlaceReviews(slug: string): Promise<Review[]> {
    if (!slug) {
      throw new Error('Slug is required');
    }

    const response = await this.fetchWithError(`${this.baseUrl}/api/places/${slug}/reviews`);
    return response.reviews || [];
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
    status?: string;
    sortBy?: "name" | "createdAt" | "featured";
    sortOrder?: "asc" | "desc";
    limit?: number;
    page?: number;
  }, token?: string): Promise<AdminPlacesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.ward) queryParams.append("ward", params.ward);
    if (params?.status) queryParams.append("status", params.status);
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

  async getAdminStats(params?: {
    search?: string;
  }, token?: string): Promise<AdminStats> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append("search", params.search);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/admin/places/stats${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers }) as Promise<AdminStats>;
  }

  // Approve a pending place
  async approvePlace(id: string, token: string): Promise<PlaceDetail> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}/approve`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.place;
  }

  // Reject a pending place
  async rejectPlace(id: string, token: string): Promise<PlaceDetail> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.place;
  }

  // Generate AI summary for a place from reviews
  async generatePlaceSummary(id: string, token: string): Promise<{ summary: string }> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}/summary`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response;
  }

  // ============ BOOKING ENDPOINTS ============

  // Create a booking
  async createBooking(data: {
    placeId: string;
    bookingDate: string;
    guestCount: number;
    note?: string;
  }, token: string): Promise<Booking> {
    return this.fetchWithError(`${this.baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Get current user's bookings
  async getUserBookings(params?: {
    page?: number;
    limit?: number;
  }, token?: string): Promise<BookingsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/bookings${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Cancel a booking (user)
  async cancelBooking(bookingId: string, token: string): Promise<MessageResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Get all bookings (admin only)
  async getAllBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }, token?: string): Promise<BookingsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/admin/bookings${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Confirm a booking (admin)
  async confirmBooking(bookingId: string, token: string): Promise<Booking> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/bookings/${bookingId}/confirm`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Cancel a booking (admin)
  async cancelBookingAdmin(bookingId: string, token: string): Promise<Booking> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // ============ PARTNER ENDPOINTS ============

  // Register as a partner
  async registerPartner(data: {
    businessName: string;
    contactName: string;
    phone: string;
    email: string;
  }): Promise<PartnerLead> {
    return this.fetchWithError(`${this.baseUrl}/api/partners/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get all partner leads (admin only)
  async getAllPartnerLeads(params?: {
    page?: number;
    limit?: number;
  }, token?: string): Promise<PartnerLeadsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/admin/partners${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Get partner lead by ID (admin)
  async getPartnerLeadById(id: string, token?: string): Promise<PartnerLead> {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.fetchWithError(`${this.baseUrl}/api/admin/partners/${id}`, { headers });
  }

  // Delete partner lead (admin)
  async deletePartnerLead(id: string, token: string): Promise<MessageResponse> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/partners/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
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

  // ============ USER MANAGEMENT ENDPOINTS (Admin) ============

  // Get all users with filtering and pagination
  async getAllUsers(params?: {
    search?: string;
    role?: "ADMIN" | "USER" | "PARTNER" | "CONTRIBUTOR";
    isActive?: boolean;
    sortBy?: "fullName" | "email" | "createdAt" | "role";
    sortOrder?: "asc" | "desc";
    limit?: number;
    page?: number;
  }, token?: string): Promise<AdminUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/admin/users${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Get user statistics
  async getUserStats(token?: string): Promise<UserStatsResponse> {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.fetchWithError(`${this.baseUrl}/api/admin/users/stats`, { headers });
  }

  // Get user by ID
  async getUserByIdAdmin(id: string, token?: string): Promise<AdminUser> {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.fetchWithError(`${this.baseUrl}/api/admin/users/${id}`, { headers });
  }

  // Create a new user (admin)
  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: "ADMIN" | "USER" | "PARTNER" | "CONTRIBUTOR";
  }, token: string): Promise<AdminUser> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Update user role
  async updateUserRole(userId: string, role: "ADMIN" | "USER" | "PARTNER" | "CONTRIBUTOR", token: string): Promise<AdminUser> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
  }

  // Create partner account from lead
  async createPartnerAccount(leadId: string, password: string, token: string): Promise<AdminUser> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/partners/${leadId}/create-account`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });
  }

  // Delete user (soft delete by default, permanent=true for hard delete)
  async deleteUser(userId: string, token: string, permanent: boolean = false): Promise<MessageResponse> {
    const queryParams = permanent ? "?permanent=true" : "";
    return this.fetchWithError(`${this.baseUrl}/api/admin/users/${userId}${queryParams}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Restore a soft-deleted user
  async restoreUser(userId: string, token: string): Promise<AdminUser> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/users/${userId}/restore`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Delete place (soft delete by default, permanent=true for hard delete)
  async deletePlaceWithOption(id: string, token: string, permanent: boolean = false): Promise<void> {
    const queryParams = permanent ? "?permanent=true" : "";
    await this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}${queryParams}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Restore a soft-deleted place
  async restorePlace(id: string, token: string): Promise<PlaceDetail> {
    return this.fetchWithError(`${this.baseUrl}/api/admin/places/${id}/restore`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // ============ PARTNER DASHBOARD ENDPOINTS ============

  // Get partner dashboard statistics
  async getPartnerStats(token: string): Promise<{
    totalPlaces: number;
    approvedPlaces: number;
    pendingPlaces: number;
    rejectedPlaces: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
  }> {
    return this.fetchWithError(`${this.baseUrl}/api/partner/stats`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Get partner's places
  async getPartnerPlaces(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }, token?: string): Promise<{
    data: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      ward: string;
      district: string | null;
      coverImageUrl: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
      isActive: boolean;
      isFeatured: boolean;
      averageRating: string;
      createdAt: string;
      categories: Array<{ id: string; name: string; slug: string }>;
      images?: Array<{
        id: string;
        image_url: string;
        is_cover: boolean;
      }>;
      bookingsCount: number;
      reviewsCount: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/partner/places${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Get bookings for partner's places
  async getPartnerBookings(params?: {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED";
    page?: number;
    limit?: number;
  }, token?: string): Promise<{
    data: Array<{
      id: string;
      place: {
        id: string;
        name: string;
        slug: string;
        coverImageUrl: string | null;
      };
      user: {
        id: string;
        fullName: string;
        email: string;
      };
      bookingDate: string;
      guestCount: number;
      status: "PENDING" | "CONFIRMED" | "CANCELLED";
      note: string | null;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/partner/bookings${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Update booking status (partner)
  async updatePartnerBookingStatus(bookingId: string, status: "CONFIRMED" | "CANCELLED", token: string): Promise<Booking> {
    return this.fetchWithError(`${this.baseUrl}/api/partner/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  }

  // Create a new place (partner)
  async createPartnerPlace(data: CreatePlaceDto, token: string): Promise<PlaceDetail> {
    return this.fetchWithError(`${this.baseUrl}/api/partner/places`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Update partner's place
  async updatePartnerPlace(id: string, data: Partial<CreatePlaceDto>, token: string): Promise<PlaceDetail> {
    return this.fetchWithError(`${this.baseUrl}/api/partner/places/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // ============ CONTRIBUTOR DASHBOARD ENDPOINTS ============

  // Get contributor dashboard statistics
  async getContributorStats(token: string): Promise<{
    totalPlaces: number;
    approvedPlaces: number;
    pendingPlaces: number;
    rejectedPlaces: number;
    totalReviews: number;
  }> {
    return this.fetchWithError(`${this.baseUrl}/api/contributor/stats`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Get contributor's contributions (places)
  async getContributorContributions(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }, token?: string): Promise<{
    data: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      ward: string;
      district: string | null;
      coverImageUrl: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
      isActive: boolean;
      averageRating: string;
      createdAt: string;
      categories: Array<{ id: string; name: string; slug: string }>;
      images?: Array<{
        id: string;
        image_url: string;
        is_cover: boolean;
      }>;
      reviewsCount: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/api/contributor/places${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.fetchWithError(url, { headers });
  }

  // Create a new place (contributor)
  async createContributorPlace(data: CreatePlaceDto, token: string): Promise<PlaceDetail> {
    return this.fetchWithError(`${this.baseUrl}/api/contributor/places`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Update contributor's place (only if still PENDING)
  async updateContributorPlace(id: string, data: Partial<CreatePlaceDto>, token: string): Promise<PlaceDetail> {
    return this.fetchWithError(`${this.baseUrl}/api/contributor/places/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // ==================== USER PROFILE ====================

  // Update user profile
  async updateUserProfile(data: { fullName?: string }, token: string): Promise<{ message: string }> {
    return this.fetchWithError(`${this.baseUrl}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }, token: string): Promise<{ message: string }> {
    return this.fetchWithError(`${this.baseUrl}/api/users/change-password`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Remove visit from history
  async removeVisit(placeId: string, token: string): Promise<{ message: string }> {
    return this.fetchWithError(`${this.baseUrl}/api/me/visits/${placeId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // Get user reviews
  async getUserReviews(token: string): Promise<Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    place: {
      id: string;
      name: string;
      slug: string;
      coverImageUrl?: string | null;
      cover_image_url?: string | null;
    };
  }>> {
    return this.fetchWithError(`${this.baseUrl}/api/users/reviews`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }

  // ==================== TRAVEL PLANS (Real API at /api/plans) ====================

  // Get user's travel plans
  async getTravelPlans(token: string): Promise<TravelPlan[]> {
    return this.fetchWithError(`${this.baseUrl}/api/plans`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }) as Promise<TravelPlan[]>;
  }

  // Get travel plan detail with items
  async getTravelPlanDetail(planId: string, token: string): Promise<TravelPlanDetail | null> {
    try {
      return await this.fetchWithError(`${this.baseUrl}/api/plans/${planId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }) as TravelPlanDetail;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('404')) return null;
      throw err;
    }
  }

  // Create travel plan (only name required)
  async createTravelPlan(name: string, token: string): Promise<TravelPlan> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/plans`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    }) as CreateTravelPlanResponse;
    return {
      id: response.id,
      name: response.name,
      item_count: 0,
      created_at: response.created_at,
    };
  }

  // Delete travel plan
  async deleteTravelPlan(planId: string, token: string): Promise<{ message: string }> {
    await this.fetchWithError(`${this.baseUrl}/api/plans/${planId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return { message: "Plan deleted successfully" };
  }

  // Add place to travel plan
  async addPlaceToTravelPlan(planId: string, placeId: string, token: string): Promise<TravelPlanItem> {
    const response = await this.fetchWithError(`${this.baseUrl}/api/plans/${planId}/items`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ placeId }),
    }) as AddPlanItemResponse;
    return {
      added_at: response.item?.added_at || new Date().toISOString(),
      order: response.item?.order || 0,
      place: response.item?.place || {
        id: placeId,
        name: '',
        slug: '',
        latitude: null,
        longitude: null,
        cover_image_url: null,
      },
    };
  }

  // Remove place from travel plan (uses placeId, not itemId)
  async removePlaceFromTravelPlan(planId: string, placeId: string, token: string): Promise<void> {
    await this.fetchWithError(`${this.baseUrl}/api/plans/${planId}/items/${placeId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
