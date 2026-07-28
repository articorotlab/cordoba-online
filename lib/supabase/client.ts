import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL en .env.local",
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local",
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabasePublishableKey,
  );
}