import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, Vote } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  type: "total" | "active" | "passed" | "votes";
}

const iconMap = {
  total: FileText,
  active: Clock,
  passed: CheckCircle,
  votes: Vote,
};

export function StatsCard({ label, value, type }: StatsCardProps) {
  const Icon = iconMap[type];

  return (
    <Card data-testid={`card-stats-${type}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-semibold text-foreground" data-testid={`text-stats-value-${type}`}>
              {value}
            </p>
            <p className="text-sm text-muted-foreground" data-testid={`text-stats-label-${type}`}>
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
