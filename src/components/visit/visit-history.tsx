"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiService, VisitHistory } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { getImageUrl } from "@/lib/image-utils";

interface VisitHistoryPageProps {
  isModal?: boolean;
}

export default function VisitHistoryPage({ isModal = false }: VisitHistoryPageProps) {
  const { token, isAuthenticated } = useAuth();
  const [visits, setVisits] = useState<VisitHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchVisitHistory();
    }
  }, [isAuthenticated, token]);

  const fetchVisitHistory = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const visitHistory = await apiService.getVisitHistory(token);
      setVisits(visitHistory);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tải lịch sử ghé thăm";
      setError(errorMessage);
      console.error("Error fetching visit history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem lịch sử ghé thăm</p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600 mb-4 text-lg font-medium">
          Bạn chưa ghé thăm địa điểm nào
        </p>
        <p className="text-gray-500 mb-6">
          Hãy khám phá những địa điểm tuyệt vời và đánh dấu chúng trong lịch sử ghé thăm của bạn
        </p>
        <Link
          href="/locations"
          className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Khám phá địa điểm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">
          Lịch sử ghé thăm ({visits.length})
        </h3>
      </div>

      {/* Visit List */}
      <div className="divide-y divide-gray-200">
        {visits.map((visit, index) => {
          const imageUrl = getImageUrl(
            visit.place.cover_image_url || visit.place.coverImageUrl
          );

          return (
            <Link
              key={index}
              href={`/locations/${visit.place.slug}`}
              className="block p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={visit.place.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600">
                    {visit.place.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Ghé thăm: {formatDate(visit.visitedAt)}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
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
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Refresh Button */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <button
          onClick={fetchVisitHistory}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Làm mới
        </button>
      </div>
    </div>
  );
}
