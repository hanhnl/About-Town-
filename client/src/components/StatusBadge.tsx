import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileText, AlertCircle } from "lucide-react";

export type BillStatus = "passed" | "enacted" | "in_committee" | "introduced" | "active";

interface StatusBadgeProps {
  status: BillStatus;
}

const statusConfig: Record<BillStatus, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof Check }> = {
  passed: {
    label: "Passed",
    variant: "default",
    icon: Check,
  },
  enacted: {
    label: "Enacted",
    variant: "default",
    icon: Check,
  },
  in_committee: {
    label: "In Committee",
    variant: "outline",
    icon: Clock,
  },
  introduced: {
    label: "Introduced",
    variant: "secondary",
    icon: FileText,
  },
  active: {
    label: "Active",
    variant: "outline",
    icon: AlertCircle,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className="text-sm font-medium px-3 py-1 gap-1.5"
      data-testid={`badge-status-${status}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
