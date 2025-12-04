"use client";

import AuthRouteGuard from "@/components/auth-route-guard";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRouteGuard allowedRoles={["PARTNER", "ADMIN"]}>
      {children}
    </AuthRouteGuard>
  );
}
