"use server";

import {
  headers,
} from "next/headers";
import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

function getRequiredField(
  formData: FormData,
  field: string,
): string {
  const value =
    formData.get(field);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    redirect(
      `/recuperar-contrasena?error=${encodeURIComponent(
        "Escribe tu correo electrónico.",
      )}`,
    );
  }

  return value
    .trim()
    .toLocaleLowerCase("es-MX");
}

function getSafeRedirectPath(
  formData: FormData,
): string {
  const redirectTo =
    formData.get("redirect");

  if (
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    return redirectTo;
  }

  return "/";
}

async function getApplicationOrigin(): Promise<string> {
  const requestHeaders =
    await headers();

  const forwardedHost =
    requestHeaders.get(
      "x-forwarded-host",
    );

  const host =
    forwardedHost ??
    requestHeaders.get("host");

  const forwardedProtocol =
    requestHeaders.get(
      "x-forwarded-proto",
    );

  const protocol =
    forwardedProtocol ??
    (host?.startsWith("localhost")
      ? "http"
      : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function requestPasswordReset(
  formData: FormData,
) {
  const email =
    getRequiredField(
      formData,
      "email",
    );

  const redirectTo =
    getSafeRedirectPath(
      formData,
    );

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    const params =
      new URLSearchParams({
        error:
          "Escribe un correo electrónico válido.",
        redirect:
          redirectTo,
      });

    redirect(
      `/recuperar-contrasena?${params.toString()}`,
    );
  }

  const origin =
    await getApplicationOrigin();

  const callbackUrl =
    new URL(
      "/auth/callback",
      origin,
    );

  callbackUrl.searchParams.set(
    "next",
    "/actualizar-contrasena",
  );

  callbackUrl.searchParams.set(
    "redirect",
    redirectTo,
  );

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          callbackUrl.toString(),
      },
    );

  if (error) {
    console.error(
      "Error al solicitar recuperación de contraseña:",
      error,
    );

    const params =
      new URLSearchParams({
        error:
          "No fue posible enviar el correo en este momento. Espera unos minutos e inténtalo nuevamente.",
        redirect:
          redirectTo,
      });

    redirect(
      `/recuperar-contrasena?${params.toString()}`,
    );
  }

  const params =
    new URLSearchParams({
      sent: "true",
      redirect:
        redirectTo,
    });

  redirect(
    `/recuperar-contrasena?${params.toString()}`,
  );
}