import Link from "next/link";
import {
  ArrowLeft,
  CircleCheck,
  LockKeyhole,
  MailCheck,
  UserRound,
} from "lucide-react";

import { login } from "@/app/auth/actions";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginPageProps = {
  searchParams: Promise<{
    confirmation?: string;
    error?: string;
    message?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const {
    confirmation,
    error,
    message,
    redirect: redirectTo,
  } = await searchParams;

  const safeRedirect =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
        ? redirectTo
        : "/";

  const confirmationRequired =
    confirmation === "required";

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link
            href={safeRedirect}
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
              <LockKeyhole
                aria-hidden="true"
                className="size-6"
              />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
              Iniciar sesión
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ingresa con tu correo electrónico o con el
              nombre de usuario proporcionado por
              cordoba.online.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {confirmationRequired && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <MailCheck
                      aria-hidden="true"
                      className="size-5"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">
                      Confirma tu correo electrónico
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Tu cuenta fue creada correctamente.
                      Enviamos un enlace de confirmación a
                      tu correo electrónico.
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6 text-blue-700">
                      Abre el enlace recibido para activar
                      tu cuenta antes de iniciar sesión.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm font-medium leading-6 text-emerald-700">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <form
              action={login}
              className="space-y-5"
            >
              <input
                type="hidden"
                name="redirect"
                value={safeRedirect}
              />

              <div>
                <label
                  htmlFor="identifier"
                  className="text-sm font-semibold text-slate-950"
                >
                  Correo o nombre de usuario
                </label>

                <div className="relative mt-2">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    placeholder="correo@ejemplo.com"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-950"
                >
                  Contraseña
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
                    autoComplete="current-password"
                    required
                    placeholder="Tu contraseña"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl text-sm font-bold"
              >
                Iniciar sesión
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Todavía no tienes una cuenta?{" "}
              <Link
                href={`/registro?redirect=${encodeURIComponent(
                  safeRedirect,
                )}`}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}