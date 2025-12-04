import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-utils";
import { PlaceSummary } from "@/lib/api";
import { getCategoryBadgeClasses, DEFAULT_BADGE_CLASSES } from "@/lib/category-colors";
import { formatRating } from "@/lib/rating-utils";

interface LocationCardProps {
  location: PlaceSummary;
}

export default function LocationCard({ location }: LocationCardProps) {
  // Get cover image - prioritize images array with isCover flag
  // This handles new locations properly
  let imageUrl = location.cover_image_url;
  
  if (location.images && location.images.length > 0) {
    const coverImage = location.images.find(img => img.is_cover);
    if (coverImage) {
      imageUrl = getImageUrl(coverImage.image_url);
    } else if (location.images[0]) {
      // Fallback to first image if no cover set
      imageUrl = getImageUrl(location.images[0].image_url);
    }
  }
  
  // Convert storage path to full CDN URL
  imageUrl = getImageUrl(imageUrl);

  // Debug: Log location data to check if average_rating is present
  if (location.average_rating !== undefined) {
    console.log(`Location: ${location.name}, Rating: ${location.average_rating}`);
  }

  return (
    <Link href={`/locations/${location.slug}`} className="group h-full">
      <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

          {/* Category tags with featured */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
            {/* Categories or fallback */}
            <div className="flex flex-wrap gap-1">
              {location.categories && location.categories.length > 0 ? (
                location.categories.slice(0, 2).map((category) => (
                  <div
                    key={category.id}
                    className={`${getCategoryBadgeClasses(category.slug)} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium w-fit`}
                  >
                    {category.name}
                  </div>
                ))
              ) : (
                <div className={`${DEFAULT_BADGE_CLASSES} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium w-fit`}>
                  Chưa phân loại
                </div>
              )}
            </div>
            {location.is_featured && (
              <div className="flex items-center gap-1 bg-purple-600 bg-opacity-90 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold w-fit">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Nổi bật
              </div>
            )}
          </div>

          {/* Title overlay on image */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-end justify-between">
            <h3
              className="text-white text-sm sm:text-lg md:text-xl font-bold group-hover:text-gray-200 transition-colors duration-300 flex-1 line-clamp-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {location.name}
            </h3>
            {/* Rating badge */}
              <div className="flex items-center gap-1 bg-yellow-500/20 bg-opacity-90 backdrop-blur-sm text-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ml-1 sm:ml-2 flex-shrink-0">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {formatRating(location.average_rating)}
              </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
          {/* Location */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.ward || "TP. Hồ Chí Minh"}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 flex-grow">
            {location.description || "Khám phá địa điểm thú vị này"}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-blue-600 font-medium text-xs sm:text-sm group-hover:text-blue-700 transition-colors">
              Khám phá chi tiết →
            </span>
            <div className="flex items-center space-x-1">
              {/* Activity icons */}
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        {/* <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 pointer-events-none"></div> */}
      </article>
    </Link>
  );
}