import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

type AuthErrorLike = {
  code?: unknown;
  message?: unknown;
};

function isInvalidRefreshTokenError(
  error: unknown,
): boolean {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  const authError =
    error as AuthErrorLike;

  const code =
    typeof authError.code === "string"
      ? authError.code
      : "";

  const message =
    typeof authError.message === "string"
      ? authError.message.toLowerCase()
      : "";

  return (
    code === "refresh_token_not_found" ||
    code === "refresh_token_already_used" ||
    message.includes(
      "refresh token not found",
    ) ||
    message.includes(
      "invalid refresh token",
    )
  );
}

function isSupabaseAuthCookie(
  cookieName: string,
): boolean {
  /*
   * Incluye tanto la cookie principal como sus
   * posibles fragmentos:
   *
   * sb-...-auth-token
   * sb-...-auth-token.0
   * sb-...-auth-token.1
   */
  return (
    cookieName.startsWith("sb-") &&
    cookieName.includes(
      "-auth-token",
    )
  );
}

function clearBrokenAuthCookies(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const authCookies =
    request.cookies
      .getAll()
      .filter((cookie) =>
        isSupabaseAuthCookie(
          cookie.name,
        ),
      );

  for (const cookie of authCookies) {
    /*
     * Evita que los Server Components de esta misma
     * petición sigan leyendo la cookie dañada.
     */
    request.cookies.delete(
      cookie.name,
    );

    /*
     * Indica al navegador que debe eliminarla.
     */
    response.cookies.set(
      cookie.name,
      "",
      {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
      },
    );
  }

  response.headers.set(
    "Cache-Control",
    "private, no-store",
  );

  return response;
}

export async function updateSession(
  request: NextRequest,
) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !supabaseUrl ||
    !supabasePublishableKey
  ) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value,
              );
            },
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  try {
    /*
     * Supabase recomienda getClaims() en el Proxy:
     * valida el JWT y refresca la sesión cuando
     * corresponde.
     */
    const {
      error,
    } =
      await supabase.auth.getClaims();

    if (
      error &&
      isInvalidRefreshTokenError(
        error,
      )
    ) {
      return clearBrokenAuthCookies(
        request,
        response,
      );
    }
  } catch (error) {
    if (
      isInvalidRefreshTokenError(
        error,
      )
    ) {
      return clearBrokenAuthCookies(
        request,
        response,
      );
    }

    /*
     * Un fallo temporal de Auth no debe derribar
     * toda la página pública.
     */
    console.error(
      "Error al actualizar la sesión de Supabase:",
      error,
    );
  }

  /*
   * Evita que Cloudflare u otro proxy almacene
   * respuestas que puedan incluir Set-Cookie.
   */
  response.headers.set(
    "Cache-Control",
    "private, no-store",
  );

  return response;
}