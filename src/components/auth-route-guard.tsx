"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

type UserRole = "USER" | "ADMIN" | "PARTNER" | "CONTRIBUTOR";

interface AuthRouteGuardProps {
  children: React.ReactNode;
  /** List of allowed roles. If empty or not provided, any authenticated user can access. */
  allowedRoles?: UserRole[];
}

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const expTime = payload.exp * 1000;
    return Date.now() >= expTime;
  } catch {
    return true;
  }
};

/**
 * AuthRouteGuard - Protects authenticated routes
 * - Redirects to home if no token or token expired
 * - Shows forbidden page if user role is not in allowedRoles
 */
export default function AuthRouteGuard({ children, allowedRoles = [] }: AuthRouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) return;

    // Get token from localStorage and validate
    const savedToken = localStorage.getItem("auth_token");

    // If no token, redirect to home
    if (!savedToken) {
      router.push("/");
      return;
    }

    // Check if token is expired
    if (isTokenExpired(savedToken)) {
      // Token expired, clear auth and redirect to home
      logout();
      router.push("/");
      return;
    }

    // Check authentication from context
    if (!isAuthenticated || !user) {
      router.push("/");
      return;
    }

    // Check role requirement (if allowedRoles is specified)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
      setForbidden(true);
      setLoading(false);
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [router, logout, isAuthenticated, user, allowedRoles, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
            <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600">Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
