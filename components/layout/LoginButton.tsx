"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginButton() {
  const pathname = usePathname();

  return (
    <Link
      href={`/login?redirect=${encodeURIComponent(pathname)}`}
      className="hidden h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 lg:inline-flex"
    >
      <LogIn className="size-4" />

      Acceder
    </Link>
  );
}