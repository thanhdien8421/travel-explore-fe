"use client";

import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
            className={`block w-full pl-12 pr-24 py-4 border-2 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              isExpanded 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            } text-lg`}
          />

          {/* Search Button */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-4 rounded-r-full hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Expanded Search Suggestions */}
        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-3">Tìm kiếm phổ biến</div>
              <div className="space-y-2">
                {[
                  "Chợ Bến Thành",
                  "Địa đạo Củ Chi", 
                  "Nhà thờ Đức Bà",
                  "Dinh Độc Lập",
                  "Chùa Jade Emperor"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      onSearch(suggestion);
                      setIsExpanded(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {suggestion}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Overlay to close search when clicking outside */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}