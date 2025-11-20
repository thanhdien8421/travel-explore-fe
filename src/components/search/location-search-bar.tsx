"use client";

import { useState } from "react";

interface LocationSearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  className?: string;
}

export default function LocationSearchBar({ value, onSearch, className = "" }: LocationSearchBarProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleSearch = () => {
    if (inputValue.trim()) {
      onSearch(inputValue);
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
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
        className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      />
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
}
