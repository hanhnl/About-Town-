import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, FileText, Check, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Amendment {
  id: number;
  amendmentNumber: string;
  title: string;
  summary: string | null;
  sponsorName: string | null;
  status: string;
  voteDate: string | null;
  yesVotes: number | null;
  noVotes: number | null;
  sourceUrl: string | null;
}

interface BillAmendmentsProps {
  amendments: Amendment[];
}

export function BillAmendments({ amendments }: BillAmendmentsProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
      case "adopted":
        return (
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30 gap-1">
            <Check className="h-3 w-3" />
            Passed
          </Badge>
        );
      case "failed":
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
            <X className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  if (amendments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <h3 className="text-xl font-medium text-foreground">
            Amendments ({amendments.length})
          </h3>
        </div>

        <div className="space-y-3">
          {amendments.map((amendment) => (
            <Collapsible
              key={amendment.id}
              open={openItems.has(amendment.id)}
              onOpenChange={() => toggleItem(amendment.id)}
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full" data-testid={`button-amendment-${amendment.id}`}>
                  <div className="flex items-center justify-between gap-4 p-4 hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-medium text-foreground shrink-0">
                        {amendment.amendmentNumber}
                      </span>
                      <span className="text-muted-foreground truncate text-left">
                        {amendment.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(amendment.status)}
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openItems.has(amendment.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <div className="pt-4 space-y-3">
                      {amendment.summary && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Summary</p>
                          <p className="text-foreground">{amendment.summary}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {amendment.sponsorName && (
                          <div>
                            <span className="text-muted-foreground">Sponsor: </span>
                            <span className="text-foreground font-medium">{amendment.sponsorName}</span>
                          </div>
                        )}
                        {amendment.voteDate && (
                          <div>
                            <span className="text-muted-foreground">Vote Date: </span>
                            <span className="text-foreground">{amendment.voteDate}</span>
                          </div>
                        )}
                        {amendment.yesVotes !== null && amendment.noVotes !== null && (
                          <div>
                            <span className="text-muted-foreground">Vote: </span>
                            <span className="text-chart-1 font-medium">{amendment.yesVotes} Yes</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-destructive font-medium">{amendment.noVotes} No</span>
                          </div>
                        )}
                      </div>

                      {amendment.sourceUrl && (
                        <div className="pt-2">
                          <a
                            href={amendment.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            data-testid={`link-amendment-source-${amendment.id}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Full Amendment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
