import { AlertTriangle, Zap, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Risk is conveyed by colour AND text AND icon — never colour alone (WCAG).
const CONFIG = {
  High: {
    icon: AlertTriangle,
    label: "High Risk — Seek Immediate Veterinary Care",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  Medium: {
    icon: Zap,
    label: "Medium Risk — See a Vet Within 24 Hours",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  Low: {
    icon: CheckCircle2,
    label: "Low Risk — Monitor at Home",
    className:
      "border-green-500/40 bg-green-600/10 text-green-700 dark:text-green-400",
  },
} as const;

export type RiskLevel = keyof typeof CONFIG;

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { icon: Icon, label, className } = CONFIG[risk];
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-[2rem] border px-5 py-4",
        className,
      )}
    >
      <Icon className="size-6 shrink-0" aria-hidden />
      <p className="font-heading text-base font-semibold sm:text-lg">{label}</p>
    </div>
  );
}
