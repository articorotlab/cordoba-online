import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

function getSafeInternalPath(
  value: string | null,
  fallback: string,
): string {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  return fallback;
}

export async function GET(
  request: NextRequest,
) {
  const requestUrl =
    new URL(request.url);

  const code =
    requestUrl.searchParams.get(
      "code",
    );

  const nextPath =
    getSafeInternalPath(
      requestUrl.searchParams.get(
        "next",
      ),
      "/actualizar-contrasena",
    );

  const redirectPath =
    getSafeInternalPath(
      requestUrl.searchParams.get(
        "redirect",
      ),
      "/",
    );

  if (!code) {
    const errorUrl =
      new URL(
        "/recuperar-contrasena",
        requestUrl.origin,
      );

    errorUrl.searchParams.set(
      "error",
      "El enlace de recuperación no es válido o ha expirado.",
    );

    errorUrl.searchParams.set(
      "redirect",
      redirectPath,
    );

    return NextResponse.redirect(
      errorUrl,
    );
  }

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

  if (error) {
    console.error(
      "Error al intercambiar el código de recuperación:",
      error,
    );

    const errorUrl =
      new URL(
        "/recuperar-contrasena",
        requestUrl.origin,
      );

    errorUrl.searchParams.set(
      "error",
      "El enlace de recuperación no es válido, ya fue utilizado o ha expirado.",
    );

    errorUrl.searchParams.set(
      "redirect",
      redirectPath,
    );

    return NextResponse.redirect(
      errorUrl,
    );
  }

  const destination =
    new URL(
      nextPath,
      requestUrl.origin,
    );

  destination.searchParams.set(
    "redirect",
    redirectPath,
  );

  return NextResponse.redirect(
    destination,
  );
}