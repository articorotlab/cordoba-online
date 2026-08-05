"use server";

import {
  revalidatePath,
} from "next/cache";
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
    !value
  ) {
    throw new Error(
      `El campo ${field} es obligatorio.`,
    );
  }

  return value;
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

function buildUpdatePasswordRedirect(
  message: string,
  redirectTo: string,
): string {
  const params =
    new URLSearchParams({
      error: message,
      redirect:
        redirectTo,
    });

  return `/actualizar-contrasena?${params.toString()}`;
}

export async function updatePassword(
  formData: FormData,
) {
  const password =
    getRequiredField(
      formData,
      "password",
    );

  const confirmPassword =
    getRequiredField(
      formData,
      "confirmPassword",
    );

  const redirectTo =
    getSafeRedirectPath(
      formData,
    );

  if (password.length < 8) {
    redirect(
      buildUpdatePasswordRedirect(
        "La contraseña debe tener al menos 8 caracteres.",
        redirectTo,
      ),
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    redirect(
      buildUpdatePasswordRedirect(
        "Las contraseñas no coinciden.",
        redirectTo,
      ),
    );
  }

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    const params =
      new URLSearchParams({
        error:
          "Tu enlace de recuperación ya no es válido. Solicita uno nuevo.",
        redirect:
          redirectTo,
      });

    redirect(
      `/recuperar-contrasena?${params.toString()}`,
    );
  }

  const {
    error,
  } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    console.error(
      "Error al actualizar la contraseña:",
      error,
    );

    redirect(
      buildUpdatePasswordRedirect(
        "No fue posible actualizar la contraseña. Solicita un enlace nuevo e inténtalo nuevamente.",
        redirectTo,
      ),
    );
  }

  /*
   * Cerramos la sesión temporal creada por el enlace
   * de recuperación. El usuario deberá iniciar sesión
   * normalmente usando su contraseña nueva.
   */
  await supabase.auth.signOut();

  revalidatePath(
    "/",
    "layout",
  );

  const params =
    new URLSearchParams({
      message:
        "Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.",
      redirect:
        redirectTo,
    });

  redirect(
    `/login?${params.toString()}`,
  );
}