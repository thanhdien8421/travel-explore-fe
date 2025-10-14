"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import { apiService, CreateLocationDto } from "@/lib/api";

interface LocationFormData {
  name: string;
  description: string;
  location: string;
  image: string;
  rating: number;
}

export default function AddLocation() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "map">("info");
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    description: "",
    location: "",
    image: "",
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const locationData: CreateLocationDto = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        image: formData.image,
        rating: formData.rating,
      };

      await apiService.createLocation(locationData);
      setSuccess(true);
      
      // Redirect back to homepage after 1 second
      setTimeout(() => {
        router.push("/");
      }, 1000);
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
            Chia sẻ những địa điểm thú vị mà bạn biết với cộng đồng
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
                  <p className="text-green-800 font-medium">Thêm địa điểm thành công! Đang chuyển hướng...</p>
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
                    Bản đồ
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Sắp ra mắt</span>
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

                    {/* Vị trí */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Vị trí *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        * Trong tương lai sẽ có bản đồ để chọn vị trí chính xác
                      </p>
                    </div>

                    {/* Ảnh */}
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        URL Ảnh *
                      </label>
                      <input
                        type="text"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        required
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        * Trong tương lai sẽ hỗ trợ upload ảnh trực tiếp
                      </p>
                    </div>

            {/* Đánh giá */}
            {/* Mục này chưa hiện thực 
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá
              </label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ Tuyệt vời (5.0)</option>
                <option value={4.5}>⭐⭐⭐⭐⭐ Rất tốt (4.5)</option>
                <option value={4}>⭐⭐⭐⭐ Tốt (4.0)</option>
                <option value={3.5}>⭐⭐⭐ Khá tốt (3.5)</option>
                <option value={3}>⭐⭐⭐ Trung bình (3.0)</option>
                <option value={2.5}>⭐⭐ Dưới trung bình (2.5)</option>
                <option value={2}>⭐⭐ Kém (2.0)</option>
                <option value={1}>⭐ Rất kém (1.0)</option>
              </select>
            </div> */}

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
                  <div className="text-center py-16">
                    <svg className="mx-auto mb-6 w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Bản đồ tương tác
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tính năng chọn vị trí trên bản đồ sẽ sớm được ra mắt
                    </p>
                    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                      <p className="text-sm text-gray-500">
                        Bạn sẽ có thể chọn vị trí chính xác bằng cách nhấp vào bản đồ, 
                        tìm kiếm địa chỉ, hoặc sử dụng vị trí hiện tại của bạn.
                      </p>
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
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
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
            </div>

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