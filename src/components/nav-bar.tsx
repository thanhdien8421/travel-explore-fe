"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavBarProps {
    onSearchClick?: () => void;
}

export default function NavBar({ onSearchClick }: NavBarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();

    const navigation = [
        { name: "Trang chủ", href: "/", current: pathname === "/" },
        { name: "Địa điểm", href: "/locations", current: pathname.startsWith("/locations") },
        //Tính năng này sẽ dành cho người dùng có tài khoản hoặc admin
        // { name: "Thêm địa điểm", href: "/locations/add", current: pathname === "/locations/add" },
        // { name: "Quản lý", href: "/admin", current: pathname === "/admin" },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <img src="/logo.png" alt="Travel Explore Logo" className="h-16 w-auto mr-3" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-lg font-bold transition-colors ${item.current
                                        ? "bg-blue-100 text-blue-900"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Search and Mobile menu button */}
                    <div className="flex items-center space-x-4">
                        {/* Search Button */}
                        <button
                            onClick={() => {
                                if (onSearchClick) {
                                    onSearchClick();
                                }
                            }}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Tìm kiếm</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Login Button */}
                        <button
                            className="px-4 py-2 rounded-md bg-gradient-to-t from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center"
                            onClick={() => alert("Chức năng đăng nhập sẽ được bổ sung sau!")}
                        >
                            {/* Show icon on mobile, text on desktop */}
                            <svg
                                className="h-6 w-6 md:hidden"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <span className="hidden md:inline">Đăng nhập</span>
                        </button>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            {/* ...existing code... */}
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${item.current
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Overlay
            {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                autoFocus
                            />
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Nhấn Enter để tìm kiếm hoặc Esc để đóng
                        </div>
                    </div>
                </div>
            )} */}
        </nav>
    );
}