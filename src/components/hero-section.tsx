"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiService, PlaceSummary } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";

export default function HeroSection() {
    const [featuredPlaces, setFeaturedPlaces] = useState<PlaceSummary[]>([]);
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFeaturedPlaces();
    }, []);

    const fetchFeaturedPlaces = async () => {
        try {
            setLoading(true);
            setError(null);
            const places = await apiService.getFeaturedPlaces(6); // Get 6 featured places
            console.log("Hero - Featured places:", places);
            if (places.length > 0) {
              console.log("Hero - First place data:", places[0]);
              console.log("Hero - First place average_rating:", places[0].average_rating);
            }
            setFeaturedPlaces(places);
        } catch (err) {
            setError("Không thể tải địa điểm nổi bật");
            console.error("Error fetching featured places:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (featuredPlaces.length > 0) {
            const interval = setInterval(() => {
                setCurrentPlaceIndex((prev) => (prev + 1) % featuredPlaces.length);
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [featuredPlaces.length]);

    const currentPlace = featuredPlaces[currentPlaceIndex];

    if (loading) {
        return (
            <section className="relative min-h-[60vh] w-full shadow-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[500px] w-full">
                    <div className="flex flex-col justify-center px-6 md:px-16 py-16">
                        <h1
                            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Khám phá những<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-red-900">
                                viên ngọc ẩn giấu
                            </span>
                        </h1>
                        <p className="text-xl text-gray-800 mb-8">
                            Từ những địa điểm nổi tiếng đến những điểm dừng chân độc đáo, chúng tôi kết nối bạn với những điều tuyệt vời nhất ở Việt Nam.
                        </p>
                        <Link
                            href="#featured-locations"
                            className="inline-flex max-w-60 items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
            font-semibold rounded-full hover:from-blue-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            <span>Khám phá ngay</span>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </Link>
                    </div>
                    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-gray-200">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !currentPlace) {
        return (
            <section className="relative min-h-[60vh] w-full shadow-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[500px] w-full">
                    <div className="flex flex-col justify-center px-6 md:px-16 py-16">
                        <h1
                            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Khám phá những<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-red-900">
                                viên ngọc ẩn giấu
                            </span>
                        </h1>
                        <p className="text-xl text-gray-800 mb-8">
                            Từ những địa điểm nổi tiếng đến những điểm dừng chân độc đáo, chúng tôi kết nối bạn với những điều tuyệt vời nhất ở Việt Nam.
                        </p>
                        <Link
                            href="#featured-locations"
                            className="inline-flex max-w-60 items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
            font-semibold rounded-full hover:from-blue-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            <span>Khám phá ngay</span>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </Link>
                    </div>
                    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-gray-200">
                        <p className="text-gray-600">Không thể tải địa điểm nổi bật</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-[60vh] w-full shadow-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[500px] w-full">
                {/* Left: Text */}
                <div className="flex flex-col justify-center px-6 md:px-16 py-16">
                    <h1
                        className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Khám phá những<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-red-900">
                            viên ngọc ẩn giấu
                        </span>
                    </h1>
                    <p className="text-xl text-gray-800 mb-8">
                        Từ những địa điểm nổi tiếng đến những điểm dừng chân độc đáo, chúng tôi kết nối bạn với những điều tuyệt vời nhất ở Việt Nam.
                    </p>
                    <Link
                        href="#featured-locations"
                        className="inline-flex max-w-60 items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
        font-semibold rounded-full hover:from-blue-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                        <span>Khám phá ngay</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </Link>
                </div>
                {/* Right: Full image with overlay card */}
                <div className="relative w-full h-[400px] md:h-[500px] flex items-end">
                    {/* Full background image */}
                    <Image
                        src={getImageUrl(currentPlace.cover_image_url)}
                        alt={currentPlace.name}
                        fill
                        className="object-cover rounded-none"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Overlay gradient for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    {/* Card overlays the image, fills right column */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="bg-[rgba(0,0,0,0.5)] shadow-xl p-8 w-full mb-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3
                                    className="text-2xl font-bold text-gray-50"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {currentPlace.name}
                                </h3>
                                {/* Rating badge */}
                                {currentPlace.average_rating !== undefined && currentPlace.average_rating !== null && (
                                  <div className="flex items-center gap-1 bg-[rgba(255,255,0,0.3)] backdrop-blur-sm text-yellow-500 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {currentPlace.average_rating.toFixed(1)}
                                  </div>
                                )}
                            </div>
                            <p className="text-gray-50 mb-3">{currentPlace.description || "Khám phá địa điểm tuyệt vời này"}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-50 mb-4">
                                <span>{currentPlace.district || "TP. Hồ Chí Minh"}</span>
                                <span className="px-2 py-1 bg-blue-600 text-white rounded-full">Điểm tham quan</span>
                            </div>
                            
                            {/* CTA Button to detail page */}
                            <Link
                                href={`/locations/${currentPlace.slug}`}
                                className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-opacity-30 transition-all duration-300 font-medium"
                            >
                                <span>Xem chi tiết</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}