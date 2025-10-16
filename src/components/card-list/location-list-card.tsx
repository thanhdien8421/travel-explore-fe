import Image from "next/image";
import Link from "next/link";
import { Location } from "@/lib/api";

interface LocationListCardProps {
  location: Location;
}

export default function LocationListCard({ location }: LocationListCardProps) {
  return (
    <Link href={`/locations/${location.id}`} className="group">
      <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex gap-4 p-4">
        {/* Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={location.image}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="96px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors truncate">
            {location.name}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.location}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {location.description}
          </p>

          <div className="flex items-center gap-1 mt-2">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{location.rating}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}