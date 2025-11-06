"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import LocationMap from "@/components/location-map";
import ReviewModal from "@/components/review/review-modal";
import ExpandableReviewCard from "@/components/review/expandable-review-card";
import { apiService, PlaceDetail, Review } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { generateMapUrls } from "@/lib/geo-utils";
import { getImageUrl } from "@/lib/image-utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default function LocationDetail({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { isAuthenticated, token } = useAuth();
  const [location, setLocation] = useState<PlaceDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isMarkingVisit, setIsMarkingVisit] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, [resolvedParams.id]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const place = await apiService.getPlaceBySlug(resolvedParams.id, token || undefined);
      console.log("Place detail fetched:", place);
      console.log("Is authenticated:", isAuthenticated);
      console.log("Place visited status:", place.visited);
      setLocation(place);
      // Set reviews from place detail if available
      if (place.reviews) {
        setReviews(place.reviews);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('not found')) {
        notFound();
      } else {
        setError("Không thể tải thông tin địa điểm. Vui lòng thử lại sau.");
        console.error("Error fetching location:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsVisited = async () => {
    if (!location || !isAuthenticated || !token) return;
    
    try {
      setIsMarkingVisit(true);
      await apiService.markPlaceVisited(location.id, token);
      // Update the location object to reflect the visit
      setLocation({ ...location, visited: true });
    } catch (err) {
      console.error("Error marking place as visited:", err);
    } finally {
      setIsMarkingVisit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(252,252,252)]">
        <NavBar />
        <div className="max-w-7xl mx-auto py-20 px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700 animate-spin"></div>
            </div>
            <p className="text-gray-600">Đang tải thông tin địa điểm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-[rgb(252,252,252)]">
        <NavBar />
        <div className="max-w-7xl mx-auto py-20 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-800 mb-4 text-lg font-semibold">{error || "Không tìm thấy địa điểm"}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use images from the place detail or fallback to cover image
  const galleryImages = location.images && location.images.length > 0 
    ? location.images.map(img => ({ ...img, image_url: getImageUrl(img.image_url) }))
    : location.cover_image_url 
      ? [{ id: 'cover', image_url: getImageUrl(location.cover_image_url), caption: location.name }]
      : [{ id: 'placeholder', image_url: '/images/placeholder.png', caption: location.name }];

  return (
    <div className="min-h-screen bg-[rgb(252,252,252)]">
      <NavBar />

      {/* Header Section with Hero Image */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full">
        <Image
          src={getImageUrl(location.cover_image_url)}
          alt={location.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {location.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-lg">
              {location.is_featured && (
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">Nổi bật</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{location.district || location.city || "TP. Hồ Chí Minh"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link 
              href="/locations"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Quay lại</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button 
                  onClick={markAsVisited}
                  disabled={isMarkingVisit || location?.visited}
                  title={location?.visited ? "Đã ghi nhận ghé thăm" : "Ghi nhận địa điểm đã ghé thăm"}
                  className={`p-2 rounded-lg transition-colors ${
                    location?.visited
                      ? "bg-green-600 text-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}

              <button 
                title="Chia sẻ"
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button 
                title="Lưu"
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description Section */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 
                className="text-2xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Giới thiệu
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {location.description}
              </p>
            </section>

            {/* Image Gallery */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 
                className="text-2xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Thư viện ảnh
              </h2>
              
              {/* Main Image */}
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                <Image
                  src={galleryImages[activeImageIndex].image_url}
                  alt={galleryImages[activeImageIndex].caption || `${location.name} - Image ${activeImageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-24 rounded-lg overflow-hidden transition-all ${
                      activeImageIndex === index 
                        ? 'ring-2 ring-gray-900 ring-offset-2' 
                        : 'hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.caption || `Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Map Section */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 
                className="text-2xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Vị trí trên bản đồ
              </h2>
              
              {location.latitude && location.longitude ? (
                <div className="space-y-4">
                  <LocationMap
                    latitude={location.latitude}
                    longitude={location.longitude}
                    placeName={location.name}
                    address={location.address_text || `${location.district}, ${location.city}`}
                  />
                  
                  {/* Address info below map */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Địa chỉ</h4>
                        <p className="text-gray-600 text-sm">
                          {location.address_text || `${location.district}, ${location.city}` || "Thông tin địa chỉ đang được cập nhật"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Tọa độ: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map actions */}
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const mapUrls = generateMapUrls({ latitude: location.latitude, longitude: location.longitude }, location.name);
                      return (
                        <>
                          <a
                            href={mapUrls.googleMaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Mở trong Google Maps
                          </a>
                          <a
                            href={mapUrls.openStreetMap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Xem trên OpenStreetMap
                          </a>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto mb-4 w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-500 mb-2">Vị trí chưa được cập nhật</p>
                    <p className="text-sm text-gray-400">{location.address_text || `${location.district}, ${location.city}`}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Đánh giá
                  </h2>
                  {typeof location.average_rating === 'number' && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                      <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-yellow-800">{location.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                {isAuthenticated && (
                  <button
                    onClick={() => setIsReviewOpen(true)}
                    title="Viết đánh giá"
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4">
                  {reviews
                    .sort((a, b) => {
                      const dateA = new Date(a.created_at || a.createdAt || "").getTime();
                      const dateB = new Date(b.created_at || b.createdAt || "").getTime();
                      return dateB - dateA;
                    })
                    .map((review) => (
                      <ExpandableReviewCard key={review.id} review={review} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto mb-4 w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500 mb-4">Chưa có đánh giá nào</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setIsReviewOpen(true)}
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      Hãy là người đầu tiên đánh giá
                    </button>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-blue-800 text-sm">
                    Vui lòng <Link href="/" onClick={() => {}} className="font-semibold hover:underline">đăng nhập</Link> để viết đánh giá
                  </p>
                </div>
              )}
            </section>

            {/* Review Modal */}
            {location && (
              <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                placeId={location.id}
                placeName={location.name}
                onReviewSubmitted={() => {
                  // Refresh location to get new reviews
                  fetchLocation();
                  setIsReviewOpen(false);
                }}
              />
            )}

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-sm p-6 top-24">
              <h3 
                className="text-xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Thông tin chi tiết
              </h3>
              
              <div className="space-y-4">
                {/* Status - Featured or Regular */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="font-semibold text-gray-900">
                      {location.is_featured ? "Điểm đến nổi bật" : "Địa điểm thú vị"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium text-gray-900">
                      {location.address_text || `${location.district}, ${location.city}` || "TP. Hồ Chí Minh"}
                    </p>
                    {location.latitude && location.longitude && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tọa độ: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Opening Hours */}
                {location.opening_hours && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Giờ mở cửa</p>
                      <p className="font-medium text-gray-900">{location.opening_hours}</p>
                    </div>
                  </div>
                )}

                {/* Price */}
                {location.price_info && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Giá vé</p>
                      <p className="font-medium text-gray-900">{location.price_info}</p>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {location.contact_info && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Liên hệ</p>
                      <p className="font-medium text-gray-900">{location.contact_info}</p>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {location.tips_notes && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Gợi ý</p>
                      <p className="font-medium text-gray-900">{location.tips_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Lời khuyên chung</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Nên đến vào buổi sáng để tránh đông người</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Mang theo máy ảnh để chụp hình</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Mặc trang phục lịch sự khi tham quan</span>
                </li>
              </ul>
            </div>

            {/* Nearby Places (Placeholder) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Địa điểm gần đây
              </h3>
              <p className="text-sm text-gray-500 text-center py-6">
                Danh sách địa điểm gần đây sẽ được hiển thị ở đây
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}