import type { LucideIcon } from "lucide-react";

export type CategoryTheme =
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "amber";

export type HomeCategory = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  theme: CategoryTheme;
};