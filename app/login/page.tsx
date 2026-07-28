import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";

import { login } from "@/app/auth/actions";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const {
    error,
    message,
    redirect: redirectTo,
  } = await searchParams;

  const safeRedirect =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "/comer";

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-4"
          />
          Volver al inicio
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
              Accede para consultar todas las promociones
              disponibles en Córdoba.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {message && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                {message}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <form action={login} className="space-y-5">
              <input
                type="hidden"
                name="redirect"
                value={safeRedirect}
              />

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-950"
                >
                  Correo electrónico
                </label>

                <div className="relative mt-2">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
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