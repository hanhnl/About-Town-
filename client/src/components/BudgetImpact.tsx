import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BudgetItem {
  category: string;
  amount: number;
  change: number;
  direction: "incoming" | "outgoing";
}

interface BudgetImpactProps {
  totalCost: number;
  totalRevenue: number;
  netImpact: number;
  items: BudgetItem[];
  fiscalYear: string;
}

// todo: remove mock functionality
export const mockBudgetData: BudgetImpactProps = {
  totalCost: 2400000,
  totalRevenue: 850000,
  netImpact: -1550000,
  fiscalYear: "FY2026",
  items: [
    { category: "Infrastructure", amount: 1200000, change: 1200000, direction: "outgoing" },
    { category: "Transit Operations", amount: 450000, change: 450000, direction: "outgoing" },
    { category: "Planning Staff", amount: 350000, change: 150000, direction: "outgoing" },
    { category: "Environmental Review", amount: 200000, change: 200000, direction: "outgoing" },
    { category: "Permit Fees", amount: 400000, change: 400000, direction: "incoming" },
    { category: "Property Tax (projected)", amount: 450000, change: 450000, direction: "incoming" },
  ],
};

function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function BudgetImpact({ 
  totalCost, 
  totalRevenue, 
  netImpact, 
  items, 
  fiscalYear 
}: BudgetImpactProps) {
  const outgoingItems = items.filter(i => i.direction === "outgoing");
  const incomingItems = items.filter(i => i.direction === "incoming");
  const maxAmount = Math.max(...items.map(i => i.amount));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Impact
          </CardTitle>
          <Badge variant="outline">{fiscalYear}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <div className="text-sm text-muted-foreground mb-1">Cost</div>
            <div className="text-xl font-semibold text-destructive flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4" />
              {formatCurrency(totalCost)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Revenue</div>
            <div className="text-xl font-semibold text-primary flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            netImpact >= 0 ? "bg-primary/10" : "bg-muted"
          }`}>
            <div className="text-sm text-muted-foreground mb-1">Net Impact</div>
            <div className={`text-xl font-semibold ${
              netImpact >= 0 ? "text-primary" : "text-foreground"
            }`}>
              {netImpact >= 0 ? "+" : ""}{formatCurrency(netImpact)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-destructive" />
              Where Money Goes (Costs)
            </h4>
            <div className="space-y-2">
              {outgoingItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3" data-testid={`budget-cost-${i}`}>
                  <span className="text-sm text-foreground w-32 shrink-0">{item.category}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive/70 rounded-full"
                      style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-16 text-right">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary rotate-180" />
              Where Money Comes From (Revenue)
            </h4>
            <div className="space-y-2">
              {incomingItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3" data-testid={`budget-revenue-${i}`}>
                  <span className="text-sm text-foreground w-32 shrink-0">{item.category}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-16 text-right">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Budget estimates from the County Fiscal Impact Statement. Actual amounts may vary 
            based on implementation and economic conditions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
