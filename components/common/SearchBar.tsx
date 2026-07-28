import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchBarProps = {
  placeholder?: string;
};

export function SearchBar({
  placeholder = "¿Qué estás buscando en Córdoba?",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        aria-hidden="true"
        className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
      />

      <Input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-12 rounded-2xl pl-12"
      />
    </div>
  );
}