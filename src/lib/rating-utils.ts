/**
 * Rating Display Utilities
 * 
 * Quy tắc: Đánh giá bắt buộc ít nhất 1 sao
 * - average_rating === 0 hoặc null/undefined: Chưa có đánh giá
 * - average_rating > 0: Có đánh giá, hiển thị số sao
 */

/**
 * Check if a place has ratings
 * @param averageRating - The average rating value
 * @returns true if the place has valid ratings (> 0)
 */
export function hasRating(averageRating: number | null | undefined): boolean {
  return typeof averageRating === "number" && averageRating > 0;
}

/**
 * Format rating for display
 * @param averageRating - The average rating value
 * @returns Formatted rating string (e.g., "4.5") or fallback text
 */
export function formatRating(
  averageRating: number | null | undefined,
  fallbackText: string = "Chưa có đánh giá"
): string {
  if (hasRating(averageRating)) {
    return averageRating!.toFixed(1);
  }
  return fallbackText;
}

/**
 * Get rating display info for badges
 * @param averageRating - The average rating value
 * @returns Object with display text and whether it's a valid rating
 */
export function getRatingDisplayInfo(averageRating: number | null | undefined): {
  text: string;
  hasValidRating: boolean;
  numericValue: number;
} {
  const valid = hasRating(averageRating);
  return {
    text: valid ? averageRating!.toFixed(1) : "Chưa có đánh giá",
    hasValidRating: valid,
    numericValue: valid ? averageRating! : 0,
  };
}

// Rating labels based on score (1-5)
export const RATING_LABELS: Record<number, string> = {
  1: "Rất tệ",
  2: "Tệ", 
  3: "Bình thường",
  4: "Tốt",
  5: "Tuyệt vời",
};

/**
 * Get rating label text
 * @param rating - Rating value (1-5)
 * @returns Label text
 */
export function getRatingLabel(rating: number): string {
  return RATING_LABELS[rating] || "";
}
