"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  {
    name: "Tổng quan",
    href: "/contributor/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Đóng góp của tôi",
    href: "/contributor/locations",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: "Thêm địa điểm",
    href: "/contributor/locations/add",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

export default function ContributorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isExactMatch = pathname === item.href;
          const isParentMatch = item.href !== "/contributor/dashboard" && 
            item.href !== "/contributor/locations/add" && 
            pathname.startsWith(item.href) && 
            !pathname.startsWith("/contributor/locations/add");
          const isAddPageMatch = item.href === "/contributor/locations/add" && pathname.startsWith("/contributor/locations/add");
          const isActive = isExactMatch || isParentMatch || isAddPageMatch;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-green-800 text-white"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-800"
              } ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
              title={isCollapsed && !isMobileOpen ? item.name : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {(!isCollapsed || isMobileOpen) && <span className="font-medium truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-gray-100 space-y-1">
        <Link
          href="/"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
            isCollapsed && !isMobileOpen ? "justify-center" : ""
          }`}
          title={isCollapsed && !isMobileOpen ? "Về trang chủ" : undefined}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {(!isCollapsed || isMobileOpen) && <span className="font-medium">Về trang chủ</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
            isCollapsed && !isMobileOpen ? "justify-center" : ""
          }`}
          title={isCollapsed && !isMobileOpen ? "Đăng xuất" : undefined}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {(!isCollapsed || isMobileOpen) && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-green-800 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        >
          <aside 
            className="w-64 h-full bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <span className="font-semibold text-gray-900">Menu CTV</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex bg-white border-r border-gray-200 h-full flex-col flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <div className="p-2 flex justify-end border-b border-gray-100">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
