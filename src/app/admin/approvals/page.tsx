"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/nav-bar";
import AdminSidebar from "@/components/admin-sidebar";
import { apiService } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";

interface PendingPlace {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  ward: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  createdBy?: {
    id?: string;
    fullName: string;
    email: string;
  };
  images?: Array<{
    id: string;
    image_url: string;
    is_cover: boolean;
  }>;
}

export default function AdminApprovalPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<PendingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.role !== "ADMIN") {
        router.push("/");
        return;
      }
    } catch (err) {
      router.push("/");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchPendingPlaces();
    }
  }, [token, page]);

  const fetchPendingPlaces = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminPlaces(
        {
          status: "PENDING",
          sortBy: "createdAt",
          sortOrder: "asc",
          limit: 10,
          page,
        },
        token || ""
      );

      const transformedData = response.data.map((place: {
        id: string;
        name: string;
        description: string | null;
        slug: string;
        ward: string | null;
        coverImageUrl: string | null;
        createdAt: string;
        createdBy?: { id: string; fullName: string; email: string };
        images?: { id: string; image_url: string; is_cover: boolean }[];
      }) => ({
        id: place.id,
        name: place.name,
        description: place.description,
        slug: place.slug,
        ward: place.ward,
        coverImageUrl: place.coverImageUrl,
        createdAt: place.createdAt,
        createdBy: place.createdBy,
        images: place.images,
      }));

      setPlaces(transformedData);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách bài chờ duyệt");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (placeId: string) => {
    if (!token) return;

    setIsProcessing(placeId);
    try {
      await apiService.approvePlace(placeId, token);
      setPlaces(places.filter((p) => p.id !== placeId));
      setError(null);
    } catch (err) {
      setError("Lỗi khi duyệt bài viết");
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (placeId: string) => {
    if (!token) return;

    setIsProcessing(placeId);
    try {
      await apiService.rejectPlace(placeId, token);
      setPlaces(places.filter((p) => p.id !== placeId));
      setError(null);
    } catch (err) {
      setError("Lỗi khi từ chối bài viết");
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-[rgb(252,252,252)]" style={{ scrollbarGutter: 'stable' }}>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 lg:px-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Chờ duyệt
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Quản lý các địa điểm chờ duyệt từ người dùng
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
                    <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">Không có bài nào chờ duyệt</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Địa điểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khu vực
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {places.map((place) => {
                        // Get image URL - prioritize images array
                        let imageUrl = place.coverImageUrl;
                        if (place.images && place.images.length > 0) {
                          const coverImage = place.images.find(img => img.is_cover);
                          if (coverImage) {
                            imageUrl = getImageUrl(coverImage.image_url);
                          } else if (place.images[0]) {
                            imageUrl = getImageUrl(place.images[0].image_url);
                          }
                        }
                        imageUrl = getImageUrl(imageUrl);
                        
                        return (
                        <tr key={place.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center min-w-0">
                              <div className="flex-shrink-0 h-16 w-16">
                                <Image
                                  src={imageUrl}
                                  alt={place.name}
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              </div>
                              <div className="ml-4 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {place.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {place.description || "Chưa có mô tả"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {place.ward || "Chưa cập nhật"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {place.createdBy?.fullName || "Ẩn danh"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(place.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                              Chờ duyệt
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApprove(place.id)}
                                disabled={isProcessing === place.id}
                                title="Duyệt"
                                className="w-9 h-9 flex items-center justify-center border border-green-500 text-green-500 bg-white rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReject(place.id)}
                                disabled={isProcessing === place.id}
                                title="Từ chối"
                                className="w-9 h-9 flex items-center justify-center border border-red-500 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
