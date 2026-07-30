"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  loginIdentifierToEmail,
  normalizeLoginIdentifier,
} from "@/lib/auth/identifiers";
import { createClient } from "@/lib/supabase/server";

function getRequiredField(
  formData: FormData,
  field: string,
) {
  const value = formData.get(field);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `El campo ${field} es obligatorio.`,
    );
  }

  return value.trim();
}

function getSafeRedirectPath(
  formData: FormData,
) {
  const redirectTo =
    formData.get("redirect");

  if (
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    return redirectTo;
  }

  return "/comer";
}

function buildLoginRedirect(
  type: "error" | "message",
  message: string,
  redirectTo: string,
) {
  const params = new URLSearchParams({
    [type]: message,
    redirect: redirectTo,
  });

  return `/login?${params.toString()}`;
}

function buildEmailConfirmationRedirect(
  redirectTo: string,
) {
  const params = new URLSearchParams({
    confirmation: "required",
    redirect: redirectTo,
  });

  return `/login?${params.toString()}`;
}

function isEmailNotConfirmedError(
  error: {
    code?: string;
    message?: string;
  } | null,
): boolean {
  if (!error) {
    return false;
  }

  if (error.code === "email_not_confirmed") {
    return true;
  }

  return (
    error.message
      ?.toLocaleLowerCase("en-US")
      .includes("email not confirmed") ??
    false
  );
}

async function getPostLoginPath(
  userId: string,
  requestedPath: string,
) {
  const supabase = await createClient();

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("platform_role")
    .eq("id", userId)
    .maybeSingle();

  if (
    !profileError &&
    profile?.platform_role === "admin"
  ) {
    return "/admin";
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("restaurant_members")
    .select("restaurant_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    !membershipError &&
    membership
  ) {
    return "/panel";
  }

  if (
    requestedPath.startsWith("/admin") ||
    requestedPath.startsWith("/panel")
  ) {
    return "/comer";
  }

  return requestedPath;
}

export async function login(
  formData: FormData,
) {
  const identifier = getRequiredField(
    formData,
    "identifier",
  );

  const password = getRequiredField(
    formData,
    "password",
  );

  const requestedPath =
    getSafeRedirectPath(formData);

  let email: string;

  try {
    email =
      loginIdentifierToEmail(identifier);
  } catch {
    redirect(
      buildLoginRedirect(
        "error",
        "Escribe un correo o nombre de usuario válido.",
        requestedPath,
      ),
    );
  }

  const supabase = await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (isEmailNotConfirmedError(error)) {
    redirect(
      buildLoginRedirect(
        "error",
        "Tu correo todavía no ha sido confirmado. Revisa tu bandeja de entrada y abre el enlace de confirmación para activar tu cuenta.",
        requestedPath,
      ),
    );
  }

  if (
    error ||
    !data.user
  ) {
    redirect(
      buildLoginRedirect(
        "error",
        "Usuario, correo o contraseña incorrectos.",
        requestedPath,
      ),
    );
  }

  const destination =
    await getPostLoginPath(
      data.user.id,
      requestedPath,
    );

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function register(
  formData: FormData,
) {
  const name = getRequiredField(
    formData,
    "name",
  );

  const phone = getRequiredField(
    formData,
    "phone",
  );

  const email =
    normalizeLoginIdentifier(
      getRequiredField(
        formData,
        "email",
      ),
    );

  const password = getRequiredField(
    formData,
    "password",
  );

  const confirmPassword =
    getRequiredField(
      formData,
      "confirmPassword",
    );

  const redirectTo =
    getSafeRedirectPath(formData);

  const normalizedPhone =
    phone.replace(/\D/g, "");

  if (name.length < 2) {
    redirect(
      `/registro?error=${encodeURIComponent(
        "Escribe un nombre válido.",
      )}&redirect=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  if (
    normalizedPhone.length < 10 ||
    normalizedPhone.length > 15
  ) {
    redirect(
      `/registro?error=${encodeURIComponent(
        "Escribe un número de teléfono válido.",
      )}&redirect=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  if (password.length < 8) {
    redirect(
      `/registro?error=${encodeURIComponent(
        "La contraseña debe tener al menos 8 caracteres.",
      )}&redirect=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  if (
    password !== confirmPassword
  ) {
    redirect(
      `/registro?error=${encodeURIComponent(
        "Las contraseñas no coinciden.",
      )}&redirect=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone_number:
          normalizedPhone,
      },
    },
  });

  if (error) {
    redirect(
      `/registro?error=${encodeURIComponent(
        error.message,
      )}&redirect=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  revalidatePath("/", "layout");

  /*
   * Si Supabase crea una sesión inmediatamente,
   * significa que la confirmación por correo no es
   * obligatoria y podemos continuar normalmente.
   */
  if (data.session) {
    redirect(redirectTo);
  }

  /*
   * Si no existe una sesión, la cuenta fue creada,
   * pero el usuario debe confirmar su correo.
   */
  redirect(
    buildEmailConfirmationRedirect(
      redirectTo,
    ),
  );
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}