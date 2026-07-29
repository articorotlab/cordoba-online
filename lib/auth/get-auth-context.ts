import "server-only";

import { createClient } from "@/lib/supabase/server";

type PlatformRole = "admin" | "user";

type RestaurantRole =
  | "owner"
  | "editor";

type AuthenticatedProfile = {
  id: string;
  username: string;
  full_name: string;
  platform_role: PlatformRole;
};

type RestaurantMembership = {
  restaurant_id: string;
  role: RestaurantRole;
};

type Restaurant = {
  id: string;
  name: string;
};

export type UnauthenticatedContext = {
  type: "unauthenticated";
  user: null;
  profile: null;
  membership: null;
  restaurant: null;
};

export type AdminAuthContext = {
  type: "admin";
  user: {
    id: string;
    email: string | null;
  };
  profile: AuthenticatedProfile & {
    platform_role: "admin";
  };
  membership: null;
  restaurant: null;
};

export type RestaurantAuthContext = {
  type: "restaurant";
  user: {
    id: string;
    email: string | null;
  };
  profile: AuthenticatedProfile;
  membership: RestaurantMembership;
  restaurant: Restaurant;
};

export type UserAuthContext = {
  type: "user";
  user: {
    id: string;
    email: string | null;
  };
  profile: AuthenticatedProfile | null;
  membership: null;
  restaurant: null;
};

export type AuthContext =
  | UnauthenticatedContext
  | AdminAuthContext
  | RestaurantAuthContext
  | UserAuthContext;

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      type: "unauthenticated",
      user: null,
      profile: null,
      membership: null,
      restaurant: null,
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, platform_role",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profileError &&
    profile?.platform_role === "admin"
  ) {
    return {
      type: "admin",
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile: {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        platform_role: "admin",
      },
      membership: null,
      restaurant: null,
    };
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("restaurant_members")
    .select(
      "restaurant_id, role",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    !membershipError &&
    membership
  ) {
    const {
      data: restaurant,
      error: restaurantError,
    } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq(
        "id",
        membership.restaurant_id,
      )
      .maybeSingle();

    if (
      !restaurantError &&
      restaurant
    ) {
      return {
        type: "restaurant",
        user: {
          id: user.id,
          email: user.email ?? null,
        },
        profile: {
          id: profile?.id ?? user.id,
          username:
            profile?.username ??
            user.email?.split("@")[0] ??
            "",
          full_name:
            profile?.full_name ??
            restaurant.name,
          platform_role:
            profile?.platform_role ===
            "admin"
              ? "admin"
              : "user",
        },
        membership: {
          restaurant_id:
            membership.restaurant_id,
          role: membership.role,
        },
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
        },
      };
    }
  }

  return {
    type: "user",
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          platform_role:
            profile.platform_role ===
            "admin"
              ? "admin"
              : "user",
        }
      : null,
    membership: null,
    restaurant: null,
  };
}