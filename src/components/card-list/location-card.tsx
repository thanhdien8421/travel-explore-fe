import Image from "next/image";
import Link from "next/link";

interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
  location: string;
  rating: number;
}

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.id}`} className="group h-full">
      <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
          <Image
            src={location.image}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

          {/* Rating badge */}
          {/* <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 flex items-center gap-1 shadow-lg">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {location.rating}
          </div> */}

          {/* Category tag */}
          <div className="absolute top-4 left-4 bg-blue-600 bg-opacity-90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
            Điểm tham quan
          </div>

          {/* Title overlay on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3
              className="text-white text-xl font-bold mb-1 group-hover:text-gray-200 transition-colors duration-300"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {location.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.location}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
            {location.description}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
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