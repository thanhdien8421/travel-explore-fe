"use client";

import { usePathname } from "next/navigation";
import AuthRouteGuard from "@/components/auth-route-guard";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // /partner page is public (registration page)
  // /partner/dashboard, /partner/locations, /partner/bookings need auth
  const isPublicRoute = pathname === "/partner";
  
  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <AuthRouteGuard allowedRoles={["PARTNER", "ADMIN"]}>
      {children}
    </AuthRouteGuard>
  );
}