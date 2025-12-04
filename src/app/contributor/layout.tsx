"use client";

import AuthRouteGuard from "@/components/auth-route-guard";

export default function ContributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRouteGuard allowedRoles={["CONTRIBUTOR", "ADMIN"]}>
      {children}
    </AuthRouteGuard>
  );
}
