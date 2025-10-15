"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import LocationPicker from "@/components/location-picker";
import SupabaseImageUpload from "@/components/supabase-image-upload";
import { apiService, CreatePlaceDto } from "@/lib/api";

interface PlaceFormData {
  name: string;
  description: string;
  address_text: string;
  cover_image_url: string;
  district: string;
  city: string;
  opening_hours: string;
  price_info: string;
  contact_info: string;
  tips_notes: string;
  is_featured: boolean;
  // Map coordinates for location picking
  latitude: number | null;
  longitude: number | null;
}

export default function AddLocation() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "map">("info");
  const [formData, setFormData] = useState<PlaceFormData>({
    name: "",
    description: "",
    address_text: "",
    cover_image_url: "",
    district: "",
    city: "",
    opening_hours: "",
    price_info: "",
    contact_info: "",
    tips_notes: "",
    is_featured: false,
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCoordWarning, setShowCoordWarning] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<any>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleAddressFromMap = (address: string) => {
    setFormData(prev => ({
      ...prev,
      address_text: address,
    }));
  };

  const clearCoordinates = () => {
    setFormData(prev => ({
      ...prev,
      latitude: null,
      longitude: null,
    }));
    setShowCoordWarning(false);
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      cover_image_url: url,
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      cover_image_url: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setJsonPreview(null); // Reset preview

    // Check if coordinates are missing and warn user
    if (formData.latitude === null || formData.longitude === null) {
      setShowCoordWarning(true);
      // Still allow submission - coordinates are optional
    } else {
      setShowCoordWarning(false);
    }

    try {
      // Create the place data object matching the new API contract
      const placeData: CreatePlaceDto = {
        name: formData.name,
        description: formData.description,
        address_text: formData.address_text,
        cover_image_url: formData.cover_image_url,
        district: formData.district || undefined,
        city: formData.city || undefined,
        opening_hours: formData.opening_hours || undefined,
        price_info: formData.price_info || undefined,
        contact_info: formData.contact_info || undefined,
        tips_notes: formData.tips_notes || undefined,
        is_featured: formData.is_featured,
      };

      // Add coordinates only if they were manually picked on the map
      if (formData.latitude !== null && formData.longitude !== null) {
        (placeData as any).latitude = formData.latitude;
        (placeData as any).longitude = formData.longitude;
        (placeData as any).coordinates_source = "manual_selection"; // Help backend understand the source
      }
      // If coordinates are null, backend will geocode from address_text

      // DEMO MODE: Show JSON instead of calling API
      // Check if API is available by checking the environment
      const isDemoMode = !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes('localhost:8000');
      
      if (isDemoMode) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Show JSON preview
        setJsonPreview({
          endpoint: "POST /api/places",
          headers: {
            "Content-Type": "application/json",
          },
          body: placeData,
          note: "This data will be sent to the backend API when configured"
        });
        setSuccess(true);
      } else {
        // Use the new API method
        await apiService.createPlace(placeData);
        setSuccess(true);
        
        // Redirect back to locations page after 1 second
        setTimeout(() => {
          router.push("/locations");
        }, 1000);
      }
    } catch (err) {
      setError("Không thể thêm địa điểm. Vui lòng thử lại sau.");
      console.error("Lỗi khi thêm địa điểm:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(252,252,252)]">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Thêm địa điểm mới
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Chia sẻ những địa điểm thú vị mà bạn biết với cộng đồng. Tọa độ sẽ được tự động xác định từ địa chỉ.
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form and Tabs */}
          <div className="lg:col-span-2">
            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 font-medium">
                    {jsonPreview 
                      ? 'Dữ liệu đã được chuẩn bị! Xem JSON API Request bên dưới ↓' 
                      : 'Thêm địa điểm thành công! Tọa độ đã được tự động xác định từ địa chỉ. Đang chuyển hướng...'}
                  </p>
                </div>
              </div>
            )}

            {/* JSON Preview for Demo Mode */}
            {jsonPreview && (
              <div className="mb-6 bg-slate-900 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="mr-2">📡</span>
                    API Request Preview (Demo Mode)
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(jsonPreview.body, null, 2));
                      alert('JSON đã được copy vào clipboard!');
                    }}
                    className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
                  >
                    📋 Copy JSON
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Endpoint:</p>
                    <p className="text-sm font-mono text-green-400">{jsonPreview.endpoint}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Headers:</p>
                    <pre className="text-xs font-mono bg-slate-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(jsonPreview.headers, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Request Body:</p>
                    <pre className="text-xs font-mono bg-slate-800 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(jsonPreview.body, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-yellow-400 flex items-center">
                      💡 <span className="ml-2">{jsonPreview.note}</span>
                    </p>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => {
                        setJsonPreview(null);
                        setSuccess(false);
                        setFormData({
                          name: "",
                          description: "",
                          address_text: "",
                          cover_image_url: "",
                          district: "",
                          city: "",
                          opening_hours: "",
                          price_info: "",
                          contact_info: "",
                          tips_notes: "",
                          is_featured: false,
                          latitude: null,
                          longitude: null,
                        });
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      ➕ Thêm địa điểm khác
                    </button>
                    <button
                      onClick={() => {
                        setJsonPreview(null);
                        setSuccess(false);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Coordinate Warning */}
            {showCoordWarning && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 font-medium">Chưa chọn vị trí trên bản đồ</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Hệ thống sẽ cố gắng xác định tọa độ từ địa chỉ bạn nhập. Để tăng độ chính xác, 
                      hãy chuyển sang tab "Bản đồ" và chọn vị trí chính xác.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("map")}
                      className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                    >
                      Chuyển sang bản đồ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                    activeTab === "info"
                      ? "text-gray-900 border-b-2 border-gray-900 bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin địa điểm
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("map")}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                    activeTab === "map"
                      ? "text-gray-900 border-b-2 border-gray-900 bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Bản đồ định vị
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "info" && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tên địa điểm */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên địa điểm *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: Chợ Bến Thành"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Mô tả */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        placeholder="Mô tả chi tiết về địa điểm này..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Địa chỉ đầy đủ */}
                    <div>
                      <label htmlFor="address_text" className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ đầy đủ *
                      </label>
                      <input
                        type="text"
                        id="address_text"
                        name="address_text"
                        value={formData.address_text}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: 1 Công xã Paris, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Địa chỉ này sẽ được sử dụng để tự động tìm tọa độ trên bản đồ.</p>
                        <p className="mt-1">
                          💡 <strong>Mẹo:</strong> Nếu địa chỉ không rõ ràng hoặc không có trên bản đồ, 
                          hãy sử dụng tab "Bản đồ" để chọn vị trí chính xác.
                        </p>
                      </div>
                    </div>

                    {/* Ảnh bìa */}
                    <div>
                      <SupabaseImageUpload
                        onUploadComplete={handleImageUpload}
                        onImageRemove={handleImageRemove}
                        currentImage={formData.cover_image_url}
                        label="Ảnh bìa *"
                        required
                      />
                    </div>

                    {/* Quận/Huyện */}
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Quận 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Thành phố */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        Thành phố
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Thành phố Hồ Chí Minh"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Giờ mở cửa */}
                    <div>
                      <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-2">
                        Giờ mở cửa
                      </label>
                      <input
                        type="text"
                        id="opening_hours"
                        name="opening_hours"
                        value={formData.opening_hours}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: 8:00 - 17:00 hàng ngày"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Thông tin giá */}
                    <div>
                      <label htmlFor="price_info" className="block text-sm font-medium text-gray-700 mb-2">
                        Thông tin giá
                      </label>
                      <input
                        type="text"
                        id="price_info"
                        name="price_info"
                        value={formData.price_info}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Miễn phí hoặc 50,000 VND/người"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                      <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
                        Thông tin liên hệ
                      </label>
                      <input
                        type="text"
                        id="contact_info"
                        name="contact_info"
                        value={formData.contact_info}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: 028 3829 7787 hoặc info@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Ghi chú và mẹo */}
                    <div>
                      <label htmlFor="tips_notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú và mẹo cho du khách
                      </label>
                      <textarea
                        id="tips_notes"
                        name="tips_notes"
                        value={formData.tips_notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Các mẹo hữu ích cho du khách, ghi chú đặc biệt..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Địa điểm nổi bật */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_featured" className="ml-2 block text-sm font-medium text-gray-700">
                        Đánh dấu là địa điểm nổi bật
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? "Đang thêm..." : "Thêm địa điểm"}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "map" && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chọn vị trí trên bản đồ
                      </h3>
                      <p className="text-gray-600">
                        Chọn vị trí chính xác bằng cách nhấp vào bản đồ hoặc tìm kiếm địa chỉ
                      </p>
                      
                      {/* Coordinate Status */}
                      <div className="mt-3">
                        {formData.latitude && formData.longitude ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Đã chọn tọa độ chính xác
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠ Chưa chọn tọa độ - Hệ thống sẽ tự động xác định từ địa chỉ
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <LocationPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={handleLocationChange}
                      onAddressChange={handleAddressFromMap}
                    />
                    
                    {/* Show current coordinates and address */}
                    {(formData.latitude || formData.address_text) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">Thông tin vị trí hiện tại:</h4>
                          {formData.latitude && formData.longitude && (
                            <button
                              type="button"
                              onClick={clearCoordinates}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Xóa tọa độ
                            </button>
                          )}
                        </div>
                        {formData.latitude && formData.longitude && (
                          <p className="text-sm text-blue-800">
                            <strong>Tọa độ:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                          </p>
                        )}
                        {formData.address_text && (
                          <p className="text-sm text-blue-800 mt-1">
                            <strong>Địa chỉ:</strong> {formData.address_text}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Note about backend processing */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Cách thức hoạt động:</strong><br/>
                        • <strong>Địa chỉ</strong> là bắt buộc và sẽ được backend sử dụng để tự động tìm tọa độ<br/>
                        • <strong>Tọa độ từ bản đồ</strong> sẽ được ưu tiên nếu bạn chọn (tùy chọn)<br/>
                        • Nếu không chọn tọa độ, hệ thống vẫn hoạt động bình thường với địa chỉ
                      </p>
                    </div>

                    {/* Form submission buttons for map tab */}
                    <div className="flex gap-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.name || !formData.description || !formData.address_text || !formData.cover_image_url}
                        className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? "Đang thêm..." : "Thêm địa điểm"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Tips & Illustrations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tips Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Mẹo hữu ích</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Đặt tên địa điểm ngắn gọn, dễ nhớ và chính xác</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Mô tả chi tiết về lịch sử, đặc điểm nổi bật của địa điểm</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Sử dụng ảnh chất lượng cao, rõ nét</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Ghi rõ địa chỉ cụ thể để dễ tìm kiếm</span>
                </li>
              </ul>
            </div>

            {/* Info Card */}
            {/* <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Tính năng sắp ra mắt
                  </h3>
                  <p className="text-sm text-gray-600">
                    Trong tương lai, bạn sẽ có thể upload ảnh trực tiếp từ thiết bị 
                    và chọn vị trí chính xác trên bản đồ tương tác.
                  </p>
                </div>
              </div>
            </div> */}

            {/* Illustration */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto w-32 h-32 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p 
                className="text-lg font-semibold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Chia sẻ điểm đến yêu thích
              </p>
              <p className="text-sm text-gray-600">
                Giúp du khách khám phá những địa điểm tuyệt vời ở Việt Nam 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}