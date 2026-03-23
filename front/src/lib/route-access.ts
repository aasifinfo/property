import { AuthUser } from "@/auth/types";

export function getDefaultRouteForUser(user: AuthUser | null) {
  if (!user) return "/signin";
  if (user.role === "admin") return "/admin";
  if (user.status === "pending") return "/pending";
  if (user.status === "approved") return "/dashboard";
  return "/signin";
}

export function canAccessBrokerWorkspace(user: AuthUser | null) {
  return !!user && (user.role === "admin" || user.status === "approved");
}

export function isAdmin(user: AuthUser | null) {
  return user?.role === "admin";
}

