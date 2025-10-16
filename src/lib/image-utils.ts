/**
 * Image URL utilities for handling Supabase Storage paths
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const STORAGE_BUCKET = 'images';

/**
 * Convert a storage path to full Supabase CDN URL
 * @param path - Path like "ben-thanh-market.jpg" or "/images/placeholder.png"
 * @returns Full CDN URL
 */
export function getImageUrl(path: string | null | undefined): string {
  // Return placeholder if no path
  if (!path) {
    return '/images/placeholder.png';
  }

  // If already a full URL (http:// or https://), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a local path (starts with /images/), keep as local
  if (path.startsWith('/images/')) {
    return path;
  }

  // For any other path (filename only), treat as Supabase storage path
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct full Supabase CDN URL
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`;
}

/**
 * Examples:
 * getImageUrl("ben-thanh-market.jpg") 
 *   → "https://hhfylfdhehpnnkugiyur.supabase.co/storage/v1/object/public/images/ben-thanh-market.jpg"
 * 
 * getImageUrl("/images/placeholder.png")
 *   → "/images/placeholder.png"
 * 
 * getImageUrl("https://example.com/image.jpg")
 *   → "https://example.com/image.jpg"
 * 
 * getImageUrl(null)
 *   → "/images/placeholder.png"
 */
