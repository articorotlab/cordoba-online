"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  isValidRestaurantUsername,
  normalizeLoginIdentifier,
  usernameToInternalEmail,
} from "@/lib/auth/identifiers";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

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

function redirectToAccounts(
  type: "error" | "message",
  message: string,
): never {
  const params = new URLSearchParams({
    [type]: message,
  });

  redirect(
    `/admin/cuentas?${params.toString()}`,
  );
}

function redirectToAccountEditor(
  type: "error" | "message",
  message: string,
): never {
  const params = new URLSearchParams({
    [type]: message,
  });

  redirect(
    `/admin/cuentas/editar?${params.toString()}`,
  );
}

export async function createRestaurantAccount(
  formData: FormData,
) {
  const admin = await requireAdmin();

  const restaurantId = getRequiredField(
    formData,
    "restaurantId",
  );

  const fullName = getRequiredField(
    formData,
    "fullName",
  );

  const username =
    normalizeLoginIdentifier(
      getRequiredField(
        formData,
        "username",
      ),
    );

  const password = getRequiredField(
    formData,
    "password",
  );

  const confirmPassword = getRequiredField(
    formData,
    "confirmPassword",
  );

  if (fullName.length < 2) {
    redirectToAccounts(
      "error",
      "Escribe un nombre válido para la cuenta.",
    );
  }

  if (!isValidRestaurantUsername(username)) {
    redirectToAccounts(
      "error",
      "El usuario debe tener entre 3 y 40 caracteres y solo puede incluir letras minúsculas, números, puntos, guiones y guiones bajos.",
    );
  }

  if (password.length < 8) {
    redirectToAccounts(
      "error",
      "La contraseña debe tener al menos 8 caracteres.",
    );
  }

  if (password !== confirmPassword) {
    redirectToAccounts(
      "error",
      "Las contraseñas no coinciden.",
    );
  }

  const supabase = createAdminClient();

  const {
    data: restaurant,
    error: restaurantError,
  } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    redirectToAccounts(
      "error",
      "El restaurante seleccionado no existe.",
    );
  }

  const {
    data: existingMembership,
    error: membershipCheckError,
  } = await supabase
    .from("restaurant_members")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .limit(1)
    .maybeSingle();

  if (membershipCheckError) {
    redirectToAccounts(
      "error",
      "No fue posible verificar las cuentas del restaurante.",
    );
  }

  if (existingMembership) {
    redirectToAccounts(
      "error",
      "Este restaurante ya tiene una cuenta asignada.",
    );
  }

  const {
    data: existingProfile,
    error: profileCheckError,
  } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (profileCheckError) {
    redirectToAccounts(
      "error",
      "No fue posible verificar el nombre de usuario.",
    );
  }

  if (existingProfile) {
    redirectToAccounts(
      "error",
      "Ese nombre de usuario ya está registrado.",
    );
  }

  let internalEmail: string;

  try {
    internalEmail =
      usernameToInternalEmail(username);
  } catch {
    redirectToAccounts(
      "error",
      "El nombre de usuario no es válido.",
    );
  }

  const {
    data: createdUserData,
    error: createUserError,
  } = await supabase.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      full_name: fullName,
      account_type: "restaurant",
    },
  });

  if (
    createUserError ||
    !createdUserData.user
  ) {
    const isDuplicate =
      createUserError?.message
        .toLowerCase()
        .includes("already");

    redirectToAccounts(
      "error",
      isDuplicate
        ? "Ese nombre de usuario ya está registrado."
        : "No fue posible crear la cuenta del restaurante.",
    );
  }

  const createdUser =
    createdUserData.user;

  const { error: membershipError } =
    await supabase
      .from("restaurant_members")
      .insert({
        restaurant_id: restaurantId,
        user_id: createdUser.id,
        role: "owner",
        created_by: admin.id,
      });

  if (membershipError) {
    const { error: rollbackError } =
      await supabase.auth.admin.deleteUser(
        createdUser.id,
      );

    if (rollbackError) {
      console.error(
        "No se pudo eliminar la cuenta después de fallar la asignación:",
        rollbackError,
      );
    }

    redirectToAccounts(
      "error",
      "La cuenta no pudo asignarse al restaurante. No se guardaron los cambios.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cuentas");
  revalidatePath("/admin/cuentas/editar");

  redirectToAccounts(
    "message",
    `La cuenta de ${restaurant.name} fue creada correctamente.`,
  );
}

export async function updateRestaurantAccount(
  formData: FormData,
) {
  await requireAdmin();

  const userId = getRequiredField(
    formData,
    "userId",
  );

  const fullName = getRequiredField(
    formData,
    "fullName",
  );

  const username =
    normalizeLoginIdentifier(
      getRequiredField(
        formData,
        "username",
      ),
    );

  if (fullName.length < 2) {
    redirectToAccountEditor(
      "error",
      "Escribe un nombre válido para la cuenta.",
    );
  }

  if (!isValidRestaurantUsername(username)) {
    redirectToAccountEditor(
      "error",
      "El usuario debe tener entre 3 y 40 caracteres y solo puede incluir letras minúsculas, números, puntos, guiones y guiones bajos.",
    );
  }

  let internalEmail: string;

  try {
    internalEmail =
      usernameToInternalEmail(username);
  } catch {
    redirectToAccountEditor(
      "error",
      "El nombre de usuario no es válido.",
    );
  }

  const supabase = createAdminClient();

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("restaurant_members")
    .select("id, restaurant_id, user_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (
    membershipError ||
    !membership
  ) {
    redirectToAccountEditor(
      "error",
      "La cuenta seleccionada no pertenece a un restaurante.",
    );
  }

  const {
    data: currentProfile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, platform_role",
    )
    .eq("id", userId)
    .maybeSingle();

  if (
    profileError ||
    !currentProfile
  ) {
    redirectToAccountEditor(
      "error",
      "No fue posible cargar el perfil de la cuenta.",
    );
  }

  if (
    currentProfile.platform_role === "admin"
  ) {
    redirectToAccountEditor(
      "error",
      "No es posible editar una cuenta administrativa desde esta sección.",
    );
  }

  const {
    data: duplicatedProfile,
    error: duplicateCheckError,
  } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .limit(1)
    .maybeSingle();

  if (duplicateCheckError) {
    redirectToAccountEditor(
      "error",
      "No fue posible verificar el nombre de usuario.",
    );
  }

  if (duplicatedProfile) {
    redirectToAccountEditor(
      "error",
      "Ese nombre de usuario ya pertenece a otra cuenta.",
    );
  }

  const {
    data: authUserData,
    error: authUserError,
  } =
    await supabase.auth.admin.getUserById(
      userId,
    );

  if (
    authUserError ||
    !authUserData.user
  ) {
    redirectToAccountEditor(
      "error",
      "No fue posible encontrar el usuario en Supabase Auth.",
    );
  }

  const currentAuthUser =
    authUserData.user;

  const previousEmail =
    currentAuthUser.email;

  const previousMetadata =
    currentAuthUser.user_metadata;

  const {
    error: authUpdateError,
  } =
    await supabase.auth.admin.updateUserById(
      userId,
      {
        email: internalEmail,
        email_confirm: true,
        user_metadata: {
          ...previousMetadata,
          username,
          full_name: fullName,
          account_type: "restaurant",
        },
      },
    );

  if (authUpdateError) {
    const errorMessage =
      authUpdateError.message
        .toLowerCase();

    const isDuplicate =
      errorMessage.includes("already") ||
      errorMessage.includes("exists") ||
      errorMessage.includes("registered");

    redirectToAccountEditor(
      "error",
      isDuplicate
        ? "El correo interno de ese usuario ya pertenece a otra cuenta."
        : "No fue posible actualizar el usuario en Supabase Auth.",
    );
  }

  const {
    error: profileUpdateError,
  } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: fullName,
    })
    .eq("id", userId);

  if (profileUpdateError) {
    const rollbackAttributes: {
      email?: string;
      email_confirm?: boolean;
      user_metadata: Record<
        string,
        unknown
      >;
    } = {
      user_metadata:
        previousMetadata,
    };

    if (previousEmail) {
      rollbackAttributes.email =
        previousEmail;

      rollbackAttributes.email_confirm =
        true;
    }

    const { error: rollbackError } =
      await supabase.auth.admin.updateUserById(
        userId,
        rollbackAttributes,
      );

    if (rollbackError) {
      console.error(
        "No se pudo revertir la actualización de Supabase Auth:",
        rollbackError,
      );
    }

    redirectToAccountEditor(
      "error",
      "No fue posible actualizar el perfil. La modificación fue revertida.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cuentas");
  revalidatePath("/admin/cuentas/editar");

  redirectToAccountEditor(
    "message",
    `La cuenta ${username} fue actualizada correctamente.`,
  );
}

export async function resetRestaurantPassword(
  formData: FormData,
) {
  await requireAdmin();

  const userId = getRequiredField(
    formData,
    "userId",
  );

  const password = getRequiredField(
    formData,
    "password",
  );

  const confirmPassword = getRequiredField(
    formData,
    "confirmPassword",
  );

  if (password.length < 8) {
    redirectToAccounts(
      "error",
      "La nueva contraseña debe tener al menos 8 caracteres.",
    );
  }

  if (password !== confirmPassword) {
    redirectToAccounts(
      "error",
      "Las contraseñas no coinciden.",
    );
  }

  const supabase = createAdminClient();

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("restaurant_members")
    .select("id, restaurant_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (
    membershipError ||
    !membership
  ) {
    redirectToAccounts(
      "error",
      "La cuenta seleccionada no pertenece a un restaurante.",
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "username, platform_role",
    )
    .eq("id", userId)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.platform_role === "admin"
  ) {
    redirectToAccounts(
      "error",
      "No es posible modificar esa cuenta.",
    );
  }

  const { error: updateError } =
    await supabase.auth.admin.updateUserById(
      userId,
      {
        password,
      },
    );

  if (updateError) {
    redirectToAccounts(
      "error",
      "No fue posible restablecer la contraseña.",
    );
  }

  revalidatePath("/admin/cuentas");

  redirectToAccounts(
    "message",
    `La contraseña de ${profile.username} fue actualizada correctamente.`,
  );
}