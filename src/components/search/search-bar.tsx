"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiService, PlaceSummary } from "@/lib/api";

interface SearchBarProps {
  onSearch: (query: string, isAI?: boolean) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSummary[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recent searches:", e);
      }
    }
  }, []);

  // Debounced search function
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      if (isAISearch) {
        // Use AI-powered search for suggestions
        const response = await apiService.searchWithAI({ 
          query, 
          limit: 5 
        });
        setSuggestions(response.data || []);
      } else {
        // Use regular search
        const response = await apiService.getLocations({ 
          search: query, 
          limit: 5 
        });
        setSuggestions(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAISearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const finalQuery = query || searchQuery;
    
    if (!finalQuery.trim()) return;

    // Add to recent searches
    const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    onSearch(finalQuery, isAISearch);
    setIsExpanded(false);
    setSearchQuery("");
    setSuggestions([]);
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

  const showSuggestions = searchQuery.trim() && suggestions.length > 0;
  const showRecent = !searchQuery.trim() && recentSearches.length > 0;

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
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder={isAISearch 
              ? "Mô tả nơi bạn muốn đến..." 
              : "Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
            }
            className={`block w-full pl-12 pr-36 py-4 border-2 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              isExpanded 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            } text-lg`}
          />

          {/* AI Toggle Button */}
          <div className="absolute inset-y-0 right-28 flex items-center">
            <button
              type="button"
              onClick={() => setIsAISearch(!isAISearch)}
              className={`p-2 rounded-lg transition-colors ${
                isAISearch 
                  ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Toggle AI search"
              title={isAISearch ? "Tắt tìm kiếm AI" : "Bật tìm kiếm AI"}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </button>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-y-0 right-24 flex items-center pr-3">
              <div className="relative w-5 h-5">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300"></div>
                <div className="animate-spin absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-transparent border-t-gray-500 border-r-gray-500"></div>
              </div>
            </div>
          )}

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

        {/* Dropdown Suggestions & Recent Searches */}
        {isExpanded && (showSuggestions || showRecent) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
            <div className="p-4">
              {/* AI Search Indicator */}
              {isAISearch && (
                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="font-medium">Tìm kiếm AI đang bật</span>
                  </div>
                </div>
              )}

              {/* API Suggestions */}
              {showSuggestions && (
                <>
                  <div className="text-sm text-gray-600 mb-3 font-semibold">
                    {isAISearch ? "Kết quả AI" : "Kết quả tìm kiếm"}
                  </div>
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    {suggestions.map((place) => (
                      <button
                        key={place.id}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          handleSearch(e as unknown as React.FormEvent<HTMLFormElement>, place.name);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{place.name}</div>
                            <div className="text-sm text-gray-500 truncate">{place.ward}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Recent Searches */}
              {showRecent && (
                <>
                  <div className="text-sm text-gray-600 mb-3 font-semibold">Lịch sử tìm kiếm</div>
                  <div className="space-y-2">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          handleSearch(e as unknown as React.FormEvent<HTMLFormElement>, search);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{search}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
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