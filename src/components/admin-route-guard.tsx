"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/auth/login-modal";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminRouteGuard - Protects admin routes by checking for valid admin token
 * - Redirects to home if no token
 * - Redirects to home if token doesn't have ADMIN role
 * - Shows login modal if token is invalid
 */
export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Get token from localStorage and validate
    const savedToken = localStorage.getItem("auth_token");

    // If no token, show login modal
    if (!savedToken) {
      setShowLoginModal(true);
      setLoading(false);
      return;
    }

    // Try to decode token to check if it has admin role
    try {
      // Token format: JWT with payload containing {id, role}
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.role !== "ADMIN") {
        // Not an admin, redirect away
        router.push("/");
        return;
      }
    } catch (err) {
      // Invalid token format, show login modal
      console.error("Invalid token format:", err);
      setShowLoginModal(true);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => router.push("/")}
          onSwitchToRegister={() => {}}
          isAdminPage={true}
        />
      </>
    );
  }

  return <>{children}</>;
}
