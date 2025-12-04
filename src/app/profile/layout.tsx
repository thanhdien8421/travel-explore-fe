"use client";

import AuthRouteGuard from "@/components/auth-route-guard";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
