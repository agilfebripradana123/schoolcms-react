import type { ComponentType } from "react";

export type NavigationItem = {
  label: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
  children?: NavigationItem[];
};

export type NavigationGroup = {
  title?: string;
  items: NavigationItem[];
};
