import {
  BriefcaseBusiness,
  CalendarDays,
  ShoppingBag,
  Store,
  Utensils,
} from "lucide-react";

import type { HomeCategory } from "@/types/category";

export const homeCategories: HomeCategory[] = [
  {
    title: "Comer",
    description:
      "Descubre restaurantes, cafeterías, antojitos, postres y mucho más.",
    href: "/comer",
    icon: Utensils,
    available: true,
    theme: "orange",
  },
  {
    title: "Comprar",
    description:
      "Encuentra productos, tiendas y comercios locales de Córdoba.",
    href: "/comprar",
    icon: ShoppingBag,
    available: false,
    theme: "blue",
  },
  {
    title: "Servicios",
    description:
      "Encuentra personas y negocios que pueden ayudarte con lo que necesitas.",
    href: "/servicios",
    icon: Store,
    available: false,
    theme: "green",
  },
  {
    title: "Profesionistas",
    description:
      "Conecta con especialistas y profesionistas de diferentes áreas.",
    href: "/profesionistas",
    icon: BriefcaseBusiness,
    available: false,
    theme: "purple",
  },
  {
    title: "Qué hacer hoy",
    description:
      "Consulta eventos, cursos, ferias, carreras y actividades en Córdoba.",
    href: "/que-hacer-hoy",
    icon: CalendarDays,
    available: false,
    theme: "amber",
  },
];