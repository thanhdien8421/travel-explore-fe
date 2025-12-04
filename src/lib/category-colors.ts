/**
 * Category Color Configuration
 * Defines colors for each category based on their slug
 */

// Color enum for category badges
export enum CategoryColorClass {
  // Ẩm thực & Đồ uống - Warm tones
  RESTAURANT = "bg-orange-500",       // Nhà hàng - Quán ăn
  CAFE = "bg-amber-600",              // Quán cà phê
  BAR = "bg-rose-500",                // Bar/Pub

  // Mua sắm & Giải trí
  SHOPPING = "bg-pink-500",           // Mua sắm
  ENTERTAINMENT = "bg-purple-500",    // Giải trí - Sáng tạo

  // Văn hóa & Lịch sử
  HISTORICAL = "bg-indigo-600",       // Địa danh - Di tích
  MUSEUM = "bg-blue-500",             // Bảo tàng - Triển lãm

  // Thiên nhiên
  NATURE = "bg-green-500",            // Thiên nhiên - Không gian xanh

  // Default
  DEFAULT = "bg-gray-500",            // Chưa phân loại
}

// Map category slug to color class
const categoryColorMap: Record<string, CategoryColorClass> = {
  // Ẩm thực & Đồ uống
  "nha-hang-quan-an": CategoryColorClass.RESTAURANT,
  "quan-ca-phe": CategoryColorClass.CAFE,
  "bar-pub-lounge": CategoryColorClass.BAR,

  // Mua sắm & Giải trí
  "mua-sam": CategoryColorClass.SHOPPING,
  "giai-tri-sang-tao": CategoryColorClass.ENTERTAINMENT,

  // Văn hóa & Lịch sử
  "dia-danh-di-tich": CategoryColorClass.HISTORICAL,
  "bao-tang-trien-lam": CategoryColorClass.MUSEUM,

  // Thiên nhiên
  "thien-nhien-khong-gian-xanh": CategoryColorClass.NATURE,
};

/**
 * Get the color class for a category by its slug
 * @param slug - Category slug
 * @returns Tailwind CSS background color class
 */
export function getCategoryColorClass(slug: string): string {
  return categoryColorMap[slug] || CategoryColorClass.DEFAULT;
}

/**
 * Get full badge classes for a category
 * @param slug - Category slug
 * @returns Full Tailwind CSS classes for badge styling
 */
export function getCategoryBadgeClasses(slug: string): string {
  const colorClass = getCategoryColorClass(slug);
  return `${colorClass} bg-opacity-90 backdrop-blur-sm text-white`;
}

// Default badge classes when no category
export const DEFAULT_BADGE_CLASSES = `${CategoryColorClass.DEFAULT} bg-opacity-90 backdrop-blur-sm text-white`;

// Interface for category with color info
export interface CategoryWithColor {
  id: string;
  name: string;
  slug: string;
  colorClass: string;
}

/**
 * Enhance categories with color information
 * @param categories - Array of categories
 * @returns Array of categories with color class added
 */
export function getCategoriesWithColors(
  categories: Array<{ id: string; name: string; slug: string }>
): CategoryWithColor[] {
  return categories.map((cat) => ({
    ...cat,
    colorClass: getCategoryColorClass(cat.slug),
  }));
}
