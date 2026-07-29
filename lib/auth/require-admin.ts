import "server-only";

import { redirect } from "next/navigation";

import {
  getAuthContext,
  type AdminAuthContext,
} from "@/lib/auth/get-auth-context";

export async function requireAdmin(): Promise<AdminAuthContext["profile"]> {
  const authContext =
    await getAuthContext();

  if (
    authContext.type ===
    "unauthenticated"
  ) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        "/admin",
      )}`,
    );
  }

  if (
    authContext.type ===
    "restaurant"
  ) {
    redirect("/panel");
  }

  if (authContext.type === "user") {
    redirect("/comer");
  }

  return authContext.profile;
}