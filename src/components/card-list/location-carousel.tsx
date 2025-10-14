"use client";

import { useState, useRef, useEffect } from "react";
import LocationCard from "./location-card";
import { Location } from "@/lib/api";

interface LocationCarouselProps {
  locations: Location[];
}

export default function LocationCarousel({ locations }: LocationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  const getItemsPerView = () => {
    if (typeof window === "undefined") return itemsPerView.desktop;
    if (window.innerWidth < 768) return itemsPerView.mobile;
    if (window.innerWidth < 1024) return itemsPerView.tablet;
    return itemsPerView.desktop;
  };

  const [itemsVisible, setItemsVisible] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsVisible(getItemsPerView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, locations.length - itemsVisible);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStart = e.touches[0].clientX;
    carouselRef.current?.setAttribute("data-touch-start", touchStart.toString());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStart = parseFloat(
      carouselRef.current?.getAttribute("data-touch-start") || "0"
    );
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={carouselRef}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex-shrink-0 px-4 py-1"
              style={{ width: `${100 / itemsVisible}%` }}
            >
              <LocationCard location={location} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all z-10"
          aria-label="Previous"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {currentIndex < maxIndex && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all z-10"
          aria-label="Next"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}