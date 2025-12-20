import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown, Calendar, ExternalLink } from "lucide-react";
import { StatusBadge, type BillStatus } from "./StatusBadge";
import { TopicBadge, type Topic } from "./TopicBadge";
import { StarButton } from "./StarButton";

export interface Bill {
  id: string;
  billNumber: string;
  title: string;
  summary: string;
  status: BillStatus;
  topic: Topic;
  voteDate?: string;
  commentCount: number;
  supportVotes: number;
  opposeVotes: number;
  sourceUrl?: string;
}

interface BillCardProps {
  bill: Bill;
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function BillCard({ bill }: BillCardProps) {
  const safeSourceUrl = bill.sourceUrl && isValidHttpUrl(bill.sourceUrl) ? bill.sourceUrl : null;

  return (
    <Card
      className="hover-elevate h-full"
      data-testid={`card-bill-${bill.id}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground" data-testid={`text-bill-number-${bill.id}`}>
              {bill.billNumber}
            </span>
            <StatusBadge status={bill.status} />
          </div>
          <div className="flex items-center gap-2">
            <TopicBadge topic={bill.topic} />
            <StarButton billId={parseInt(bill.id)} />
          </div>
        </div>

        <Link href={`/bill/${bill.id}`}>
          <h3
            className="text-xl font-medium text-foreground mb-3 line-clamp-2 hover:text-primary cursor-pointer"
            data-testid={`text-bill-title-${bill.id}`}
          >
            {bill.title}
          </h3>
        </Link>

        <p
          className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-3"
          data-testid={`text-bill-summary-${bill.id}`}
        >
          {bill.summary}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-4">
            {bill.voteDate && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span data-testid={`text-vote-date-${bill.id}`}>Vote: {bill.voteDate}</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground" data-testid={`text-source-label-${bill.id}`}>
              {safeSourceUrl ? "Official source" : "Community submitted"}
            </span>
            {safeSourceUrl && (
              <a 
                href={safeSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                data-testid={`link-source-${bill.id}`}
                aria-label={`View official source for ${bill.billNumber}`}
              >
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span data-testid={`text-comments-${bill.id}`}>{bill.commentCount} comments</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-chart-2">
                <ThumbsUp className="h-4 w-4" />
                <span data-testid={`text-support-${bill.id}`}>{bill.supportVotes}</span>
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="flex items-center gap-1 text-destructive">
                <ThumbsDown className="h-4 w-4" />
                <span data-testid={`text-oppose-${bill.id}`}>{bill.opposeVotes}</span>
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link href={`/bill/${bill.id}`} data-testid={`button-view-details-${bill.id}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
