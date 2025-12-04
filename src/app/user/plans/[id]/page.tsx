"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import UserSidebar from "@/components/user-sidebar";
import { apiService, TravelPlanDetail } from "@/lib/api";
import PlanMap from "@/components/travel-plan/plan-map";
import { formatRating } from "@/lib/rating-utils";
import { getImageUrl } from "@/lib/image-utils";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<TravelPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlanDetail();
  }, [planId]);

  const fetchPlanDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Vui lòng đăng nhập");
        return;
      }
      const data = await apiService.getTravelPlanDetail(planId, token);
      console.log("=== Plan Detail Fetched ===");
      console.log("Plan data:", data);
      if (data) {
        console.log("Plan items:", data.items);
        data.items.forEach((item, idx) => {
          console.log(`Item ${idx}:`, {
            id: item.place.id,
            name: item.place.name,
            latitude: item.place.latitude,
            longitude: item.place.longitude,
          });
        });
      }
      if (!data) {
        setError("Không tìm thấy kế hoạch");
        return;
      }
      setPlan(data);
    } catch (err) {
      setError("Không thể tải kế hoạch");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    try {
      setIsDeleting(placeId);
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      await apiService.removePlaceFromTravelPlan(planId, placeId, token);
      setPlan(
        plan
          ? {
              ...plan,
              items: plan.items.filter((item) => item.place.id !== placeId),
            }
          : null
      );
      if (selectedPlaceId === placeId) {
        setSelectedPlaceId(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa địa điểm:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa kế hoạch này?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      await apiService.deleteTravelPlan(planId, token);
      router.push("/user/plans");
    } catch (err) {
      console.error("Lỗi khi xóa kế hoạch:", err);
    }
  };

  const scrollToPlace = (placeId: string) => {
    const element = document.getElementById(`plan-item-${placeId}`);
    if (element && listRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative mx-auto mb-4 w-12 h-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
              <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-900 border-r-gray-900"></div>
            </div>
            <p className="text-gray-600">Đang tải kế hoạch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" />
            </svg>
            <h2 className="text-xl font-bold text-red-800 mb-2">{error}</h2>
            <button
              onClick={() => router.back()}
              className="mt-4 text-red-600 hover:text-red-800 font-medium"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Map Mode */}
      {isFullscreenMap && plan && plan.items.length > 0 ? (
        <div className="w-screen h-screen bg-gray-900 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold text-gray-900">{plan.name}</h1>
            <button
              onClick={() => setIsFullscreenMap(false)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-1"
              title="Thu gọn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Map Container with Floating Sidebar */}
          <div className="flex-1 relative overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
            {/* Map */}
            <div className="w-full h-full absolute inset-0">
              <PlanMap
                items={plan.items}
                selectedPlaceId={selectedPlaceId}
                onPlaceSelect={(placeId) => {
                  setSelectedPlaceId(placeId);
                }}
              />
            </div>

            {/* Toggle Sidebar Button - Top left corner */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-4 left-4 z-50 bg-white text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                aria-label="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Floating Sidebar */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-30 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
              style={{
                boxShadow: sidebarOpen ? "4px 0 16px rgba(0, 0, 0, 0.15)" : "none",
              }}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {plan.items.length} địa điểm
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                  aria-label="Close sidebar"
                  title="Thu gọn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Items List */}
              <div ref={listRef} className="flex-1 overflow-y-auto space-y-1 p-2">
                {plan.items.map((item) => (
                  <div
                    key={item.place.id}
                    id={`plan-item-${item.place.id}`}
                    onClick={() => setSelectedPlaceId(item.place.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPlaceId === item.place.id
                        ? "bg-blue-50 border-2 border-blue-500 shadow-sm"
                        : "bg-white border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex gap-2">
                      <img
                        src={getImageUrl(item.place.cover_image_url)}
                        alt={item.place.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-xs">
                          {item.place.name}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {item.place.ward}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-700">
                            {formatRating(item.place.average_rating, "--")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlace(item.place.id);
                        }}
                        disabled={isDeleting === item.place.id}
                        className="text-gray-400 hover:text-red-600 transition-colors p-0.5 disabled:opacity-50 flex-shrink-0"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Split View Mode with Sidebar Layout */
        <div className="h-screen flex flex-col overflow-hidden">
          <NavBar />
          <div className="flex flex-1 overflow-hidden">
            <UserSidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
              {/* Header Area */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/user/plans")}
                    className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-gray-900 transition-all shadow-sm border border-transparent hover:border-gray-200"
                    title="Quay lại"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 
                      className="text-2xl font-bold text-gray-900 leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {plan.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span className="font-medium">{plan.items.length} địa điểm</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {plan.items.length > 0 && (
                    <button
                      onClick={() => {
                        setIsFullscreenMap(true);
                        setSidebarOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      Toàn màn hình
                    </button>
                  )}
                  <button
                    onClick={handleDeletePlan}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-h-0">
                {plan.items.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div>
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa có địa điểm nào</h2>
                      <p className="text-gray-600">Hãy thêm những địa điểm yêu thích vào kế hoạch này</p>
                      <button
                        onClick={() => router.push("/locations")}
                        className="mt-4 inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Xem địa điểm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ height: "calc(100vh - 250px)" }}>
                    {/* Left: Items List */}
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                      <div className="border-b border-gray-200 p-4 bg-white flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Danh sách địa điểm</h2>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{plan.items.length}</span>
                      </div>
                      <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto space-y-2 p-3"
                      >
                        {plan.items.map((item, index) => (
                          <div
                            key={item.place.id}
                            id={`plan-item-${item.place.id}`}
                            onClick={() => setSelectedPlaceId(item.place.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${
                              selectedPlaceId === item.place.id
                                ? "bg-blue-50 border-blue-500 shadow-sm"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex gap-3 items-center">
                              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${
                                selectedPlaceId === item.place.id 
                                  ? "bg-blue-500 text-white" 
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {index + 1}
                              </div>
                              <img
                                src={getImageUrl(item.place.cover_image_url)}
                                alt={item.place.name}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate text-sm">
                                  {item.place.name}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                  {item.place.ward}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-700">
                                    {formatRating(item.place.average_rating, "--")}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePlace(item.place.id);
                                }}
                                disabled={isDeleting === item.place.id}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                                title="Xóa từ kế hoạch"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Map */}
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full relative">
                      <PlanMap
                        items={plan.items}
                        selectedPlaceId={selectedPlaceId}
                        onPlaceSelect={(placeId) => {
                          setSelectedPlaceId(placeId);
                          scrollToPlace(placeId);
                        }}
                      />
                      <button
                        onClick={() => {
                          setIsFullscreenMap(true);
                          setSidebarOpen(true);
                        }}
                        className="absolute bottom-4 right-4 bg-white text-gray-600 hover:text-gray-900 p-2 rounded-lg shadow-lg hover:shadow-xl transition-all z-10"
                        title="Xem toàn màn hình"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m12-4h4v4M6 18h4v-4m12 4h-4v-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}