import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  ArrowRight, 
  Sparkles,
  Link as LinkIcon,
  FileText,
  Clock
} from "lucide-react";
import { StatusBadge, type BillStatus } from "./StatusBadge";

interface RelatedBill {
  id: string;
  billNumber: string;
  title: string;
  status: BillStatus;
  relationship: "amends" | "complements" | "conflicts" | "supersedes" | "predecessor";
  summary: string;
}

interface RelatedBillsProps {
  currentBillId: string;
  bills?: RelatedBill[];
  onAnalyze?: () => void;
}

export const mockRelatedBills: RelatedBill[] = [
  {
    id: "30005",
    billNumber: "ZTA-24-08",
    title: "Transit-Oriented Development Standards",
    status: "enacted",
    relationship: "complements",
    summary: "Sets development standards for areas near transit hubs, which this corridor plan builds upon."
  },
  {
    id: "30006",
    billNumber: "ZTA-23-15",
    title: "Accessory Dwelling Unit Expansion",
    status: "passed",
    relationship: "predecessor",
    summary: "Earlier legislation that allowed ADUs county-wide; this bill extends similar principles to multi-family."
  },
  {
    id: "30007",
    billNumber: "HB-25-03",
    title: "Affordable Housing Trust Fund Increase",
    status: "in_committee",
    relationship: "complements",
    summary: "Would increase funding for affordable housing programs that could support units created by this rezoning."
  },
];

const relationshipLabels = {
  amends: { label: "Amends", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  complements: { label: "Complements", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  conflicts: { label: "May Conflict", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  supersedes: { label: "Supersedes", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  predecessor: { label: "Predecessor", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

export function RelatedBills({ currentBillId, bills = mockRelatedBills, onAnalyze }: RelatedBillsProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysis(true);
      onAnalyze?.();
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GitBranch className="h-5 w-5 text-primary" />
            Related Legislation
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            data-testid="button-analyze-relations"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Analyze Connections"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAnalysis && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--sage-light))" }}>
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--sage))" }} />
              Connection Analysis
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This bill is part of a broader effort to increase housing density near transit. 
              It builds on ZTA-24-08 which established baseline standards, and aligns with pending 
              affordable housing funding in HB-25-03. Together, these bills form a coordinated 
              approach to addressing the county's housing shortage while maintaining neighborhood character.
            </p>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Analysis generated Dec 15, 2025
            </p>
          </div>
        )}

        <div className="space-y-3">
          {bills.map((bill) => (
            <Link key={bill.id} href={`/bill/${bill.id}`}>
              <div 
                className="p-4 rounded-lg border hover-elevate cursor-pointer"
                data-testid={`related-bill-${bill.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-muted-foreground">{bill.billNumber}</span>
                    <StatusBadge status={bill.status} />
                    <Badge className={relationshipLabels[bill.relationship].color}>
                      <LinkIcon className="h-3 w-3 mr-1" />
                      {relationshipLabels[bill.relationship].label}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <h4 className="font-medium text-foreground mb-1">{bill.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{bill.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>Relationships identified by legislative analysis</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
