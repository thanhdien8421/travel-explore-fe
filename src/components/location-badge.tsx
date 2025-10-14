"use client";

import { useState } from "react";

export default function LocationBadge() {
  const [showDropdown, setShowDropdown] = useState(false);

  // For future: replace with a list of provinces
  const provinces = [
    { code: "hcm", name: "TP. Hồ Chí Minh" }
    // Add more provinces here later
  ];

  return (
    <div className="flex justify-start mt-5 mb-3 mx-10">
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 font-semibold rounded-full shadow hover:bg-blue-100 transition-colors border border-blue-200"
          onClick={() => setShowDropdown((v) => !v)}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          TP. Hồ Chí Minh
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDropdown && (
          <div className="absolute left-0 mt-2 w-full bg-white border border-blue-100 rounded-xl shadow-lg z-10">
            {provinces.map((province) => (
              <button
                key={province.code}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-xl"
                onClick={() => setShowDropdown(false)}
              >
                {province.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}