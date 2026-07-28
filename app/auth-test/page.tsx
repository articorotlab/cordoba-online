import { PageContainer } from "@/components/layout/PageContainer";
import { createClient } from "@/lib/supabase/server";

export default async function AuthTestPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isMissingSession =
    error?.name === "AuthSessionMissingError" ||
    error?.message === "Auth session missing!";

  return (
    <PageContainer className="py-12">
      <h1 className="text-3xl font-bold text-slate-950">
        Prueba de Supabase Auth
      </h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {user ? (
          <>
            <p className="font-semibold text-emerald-600">
              Supabase funciona y existe una sesión iniciada.
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Usuario: {user.email}
            </p>
          </>
        ) : isMissingSession ? (
          <>
            <p className="font-semibold text-emerald-600">
              Supabase está conectado correctamente.
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Actualmente no hay una sesión iniciada.
            </p>
          </>
        ) : error ? (
          <>
            <p className="font-semibold text-red-600">
              Supabase respondió con un error inesperado.
            </p>

            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-slate-600">
              {error.message}
            </pre>
          </>
        ) : (
          <p className="font-semibold text-slate-600">
            No se encontró una sesión iniciada.
          </p>
        )}
      </div>
    </PageContainer>
  );
}