import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  LockKeyhole,
} from "lucide-react";
import {
  redirect,
} from "next/navigation";

import {
  updatePassword,
} from "@/app/actualizar-contrasena/actions";
import {
  PageContainer,
} from "@/components/layout/PageContainer";
import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  createClient,
} from "@/lib/supabase/server";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const {
    error,
    redirect: redirectTo,
  } = await searchParams;

  const safeRedirect =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

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
          "Tu enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.",
        redirect:
          safeRedirect,
      });

    redirect(
      `/recuperar-contrasena?${params.toString()}`,
    );
  }

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link
          href={`/login?redirect=${encodeURIComponent(
            safeRedirect,
          )}`}
          className="group inline-flex h-11 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-bold text-orange-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:-translate-x-0.5">
            <ArrowLeft
              aria-hidden="true"
              className="size-4"
            />
          </span>

          Volver
        </Link>

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 px-6 py-8 sm:px-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <KeyRound
                aria-hidden="true"
                className="size-6"
              />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
              Crear contraseña nueva
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Escribe y confirma la contraseña que utilizarás
              para ingresar a cordoba.online.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <form
              action={updatePassword}
              className="space-y-5"
            >
              <input
                type="hidden"
                name="redirect"
                value={safeRedirect}
              />

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-950"
                >
                  Contraseña nueva
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-slate-950"
                >
                  Confirmar contraseña nueva
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    placeholder="Repite tu contraseña nueva"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl text-sm font-bold"
              >
                Actualizar contraseña
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}