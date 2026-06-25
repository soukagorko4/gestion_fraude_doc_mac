import { cn } from "@/lib/utils";

interface FraudBadgeProps {
  type: string;
}

export function FraudBadge({ type }: FraudBadgeProps) {
  if (!type) return <span className="text-muted-foreground text-sm">—</span>;
  
  const normalizedType = type.toLowerCase();
  
  const badgeClass = cn("badge-fraud", {
    "badge-contrefacon": normalizedType.includes("contrefaçon") || normalizedType.includes("contrefacon"),
    "badge-usurpation": normalizedType.includes("usurpation"),
    "badge-falsification": normalizedType.includes("falsification") || normalizedType.includes("obtention"),
  });

  return <span className={badgeClass}>{type}</span>;
}
