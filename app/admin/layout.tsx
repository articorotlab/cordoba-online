import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  PencilLine,
  Store,
  UsersRound,
} from "lucide-react";

import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/require-admin";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    label: "Resumen",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Restaurantes",
    href: "/admin/restaurantes",
    icon: Store,
  },
  {
    label: "Cuentas",
    href: "/admin/cuentas",
    icon: UsersRound,
  },
  {
    label: "Editar cuentas",
    href: "/admin/cuentas/editar",
    icon: PencilLine,
  },
];

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/admin"
              className="text-lg font-black tracking-tight text-slate-950"
            >
              cordoba.online
            </Link>

            <p className="text-xs font-medium text-slate-500">
              Panel administrativo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-950">
                {admin.full_name}
              </p>

              <p className="text-xs text-slate-500">
                Administrador
              </p>
            </div>

            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                className="rounded-xl"
              >
                <LogOut
                  aria-hidden
                  className="size-4"
                />

                <span className="hidden sm:inline">
                  Cerrar sesión
                </span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav
            aria-label="Navegación administrativa"
            className="space-y-1"
          >
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <Icon
                    aria-hidden
                    className="size-5"
                  />

                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}