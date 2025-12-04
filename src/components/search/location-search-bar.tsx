"use client";

import { useState } from "react";

interface LocationSearchBarProps {
  value: string;
  onSearch: (query: string, isAI?: boolean) => void;
  className?: string;
}

export default function LocationSearchBar({ value, onSearch, className = "" }: LocationSearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isAISearch, setIsAISearch] = useState(false);

  const handleSearch = () => {
    if (inputValue.trim()) {
      onSearch(inputValue, isAISearch);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={`${className}`}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isAISearch 
            ? "Mô tả nơi bạn muốn đến, VD: quán cà phê yên tĩnh để làm việc..." 
            : "Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
          }
          className="w-full pl-4 pr-24 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* AI Search Toggle */}
          <button
            onClick={() => setIsAISearch(!isAISearch)}
            className={`p-2 rounded-lg transition-colors ${
              isAISearch 
                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Toggle AI search"
            title={isAISearch ? "Tắt tìm kiếm AI" : "Bật tìm kiếm AI (mô tả tự nhiên)"}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </button>
          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      {/* AI Search Indicator */}
      {isAISearch && (
        <div className="mt-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-2 text-purple-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-sm text-gray-700 font-medium">Tìm kiếm AI - mô tả bằng ngôn ngữ tự nhiên</span>
          </div>
        </div>
      )}
    </div>
  );
}
