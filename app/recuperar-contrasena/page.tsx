import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  MailCheck,
} from "lucide-react";

import {
  requestPasswordReset,
} from "@/app/recuperar-contrasena/actions";
import {
  PageContainer,
} from "@/components/layout/PageContainer";
import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";

type RecoverPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
    sent?: string;
  }>;
};

export default async function RecoverPasswordPage({
  searchParams,
}: RecoverPasswordPageProps) {
  const {
    error,
    redirect: redirectTo,
    sent,
  } = await searchParams;

  const safeRedirect =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  const emailSent =
    sent === "true";

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
              Recuperar contraseña
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Escribe el correo asociado a tu cuenta y te
              enviaremos un enlace para crear una contraseña
              nueva.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {emailSent && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <MailCheck
                      aria-hidden="true"
                      className="size-5"
                    />
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">
                      Revisa tu correo electrónico
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Si existe una cuenta asociada a ese correo,
                      recibirás un enlace para cambiar tu
                      contraseña.
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6 text-emerald-700">
                      Revisa también la carpeta de correo no
                      deseado.
                    </p>
                  </div>
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

            {!emailSent && (
              <form
                action={requestPasswordReset}
                className="space-y-5"
              >
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
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      placeholder="correo@ejemplo.com"
                      className="h-12 rounded-2xl pl-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-2xl text-sm font-bold"
                >
                  Enviar enlace de recuperación
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href={`/login?redirect=${encodeURIComponent(
                  safeRedirect,
                )}`}
                className="font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}