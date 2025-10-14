"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeaturedPlace {
    id: number;
    name: string;
    description: string;
    image: string;
    location: string;
    rating: number;
    category: string;
}

const featuredPlaces: FeaturedPlace[] = [
    {
        id: 1,
        name: "Chùa Ngọc Hoàng",
        description: "Một trong những ngôi chùa cổ nhất và linh thiêng nhất của Sài Gòn, được trang trí bằng những bức tranh tường đầy màu sắc.",
        image: "/images/jade-emperor-pagoda.jpg",
        location: "Quận 1, TP. Hồ Chí Minh",
        rating: 4.8,
        category: "Tâm linh"
    },
    {
        id: 2,
        name: "Địa đạo Củ Chi",
        description: "Hệ thống đường hầm khổng lồ được sử dụng trong thời kỳ chiến tranh, là minh chứng cho sự kiên cường của người Việt Nam.",
        image: "/images/cu-chi-tunnels.jpg",
        location: "Củ Chi, TP. Hồ Chí Minh",
        rating: 4.6,
        category: "Lịch sử"
    },
    {
        id: 3,
        name: "Chợ Bến Thành",
        description: "Biểu tượng của Sài Gòn với kiến trúc cổ điển và là trung tâm mua sắm, ẩm thực sôi động của thành phố.",
        image: "/images/ben-thanh-market.jpg",
        location: "Quận 1, TP. Hồ Chí Minh",
        rating: 4.4,
        category: "Mua sắm"
    }
];

export default function HeroSection() {
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
    const currentPlace = featuredPlaces[currentPlaceIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPlaceIndex((prev) => (prev + 1) % featuredPlaces.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

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
                        src={currentPlace.image}
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
                            <h3
                                className="text-2xl font-bold text-gray-50 mb-2"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {currentPlace.name}
                            </h3>
                            <p className="text-gray-50 mb-2">{currentPlace.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-50 mb-2">
                                <span>{currentPlace.location}</span>
                                <span className="px-2 py-1 bg-blue-600 text-white rounded-full">{currentPlace.category}</span>
                                {/* Not implemented yet

                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {currentPlace.rating}
                                </span> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}