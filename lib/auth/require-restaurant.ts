import "server-only";

import { redirect } from "next/navigation";

import {
  getAuthContext,
  type RestaurantAuthContext,
} from "@/lib/auth/get-auth-context";

export async function requireRestaurant(): Promise<RestaurantAuthContext> {
  const authContext =
    await getAuthContext();

  if (
    authContext.type ===
    "unauthenticated"
  ) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        "/panel",
      )}`,
    );
  }

  if (authContext.type === "admin") {
    redirect("/admin");
  }

  if (authContext.type === "user") {
    redirect("/comer");
  }

  return authContext;
}