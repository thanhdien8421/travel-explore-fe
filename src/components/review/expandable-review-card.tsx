"use client";

import { useState } from "react";
import { Review } from "@/lib/api";

interface ExpandableReviewCardProps {
  review: Review;
}

export default function ExpandableReviewCard({ review }: ExpandableReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Ngày không xác định";
      }
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Ngày không xác định";
    }
  };

  // Limit preview to 150 characters
  const isLongComment = review.comment.length > 150;
  const previewComment = isLongComment ? review.comment.substring(0, 150) + "..." : review.comment;

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* User info */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {review.user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {review.user?.full_name || "Người dùng"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(review.created_at || review.createdAt || "")}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Comment - Preview or Full */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed text-sm">
          {isExpanded ? review.comment : previewComment}
        </p>
      </div>

      {/* Expand/Collapse Button */}
      {isLongComment && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors mb-4"
        >
          {isExpanded ? (
            <>
              <span>Thu gọn</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Xem thêm</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </>
          )}
        </button>
      )}

      {/* Rating Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-block px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-800">
          {review.rating}/5 sao
        </span>
      </div>
    </article>
  );
}
