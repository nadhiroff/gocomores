import { Building2, Flame, Landmark, MapPin, Palette, Trees, Waves, type LucideProps } from "lucide-react";

const ICONS = { Landmark, Trees, Building2, Palette, Waves, Flame } as const;

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (ICONS as Record<string, React.ComponentType<LucideProps>>)[name] ?? MapPin;
  return <Icon aria-hidden="true" {...props} />;
}
