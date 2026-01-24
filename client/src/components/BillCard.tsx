import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown, Calendar, ExternalLink } from "lucide-react";
import { StatusBadge, type BillStatus } from "./StatusBadge";
import { TopicBadge, type Topic } from "./TopicBadge";
import { StarButton } from "./StarButton";
import { ShareButton } from "./ShareButton";

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
      <CardContent className="p-4 sm:p-6">
        {/* Mobile: Stack vertically, Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground" data-testid={`text-bill-number-${bill.id}`}>
              {bill.billNumber}
            </span>
            <StatusBadge status={bill.status} />
          </div>
          <div className="flex items-center gap-2">
            <TopicBadge topic={bill.topic} className="text-xs sm:text-sm" />
            <ShareButton
              title={bill.title}
              billNumber={bill.billNumber}
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/bill/${bill.id}`}
              description={bill.summary}
              variant="ghost"
              size="sm"
            />
            <StarButton billId={parseInt(bill.id)} />
          </div>
        </div>

        {/* Clickable title with better tap target on mobile */}
        <Link href={`/bill/${bill.id}`}>
          <h3
            className="text-lg sm:text-xl font-medium text-foreground mb-3 line-clamp-2 hover:text-primary cursor-pointer leading-tight"
            data-testid={`text-bill-title-${bill.id}`}
          >
            {bill.title}
          </h3>
        </Link>

        {/* Summary - clamp to 2 lines on mobile, 3 on desktop */}
        <p
          className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 line-clamp-2 sm:line-clamp-3"
          data-testid={`text-bill-summary-${bill.id}`}
        >
          {bill.summary}
        </p>

        {/* Meta info - responsive stacking */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            {bill.voteDate && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span data-testid={`text-vote-date-${bill.id}`} className="hidden sm:inline">Vote: {bill.voteDate}</span>
                <span data-testid={`text-vote-date-mobile-${bill.id}`} className="sm:hidden">{bill.voteDate}</span>
              </div>
            )}
            <span className="text-muted-foreground" data-testid={`text-source-label-${bill.id}`}>
              {safeSourceUrl ? "Official" : "Community"}
            </span>
            {safeSourceUrl && (
              <a
                href={safeSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 min-h-[44px] sm:min-h-0 -my-2 sm:my-0"
                data-testid={`link-source-${bill.id}`}
                aria-label={`View official source for ${bill.billNumber}`}
              >
                <ExternalLink className="h-3 w-3" />
                <span>Source</span>
              </a>
            )}
          </div>

          {/* Engagement metrics */}
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span data-testid={`text-comments-${bill.id}`}>{bill.commentCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-chart-2">
                <ThumbsUp className="h-4 w-4 flex-shrink-0" />
                <span data-testid={`text-support-${bill.id}`}>{bill.supportVotes}</span>
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="flex items-center gap-1 text-destructive">
                <ThumbsDown className="h-4 w-4 flex-shrink-0" />
                <span data-testid={`text-oppose-${bill.id}`}>{bill.opposeVotes}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Full-width button with proper touch target */}
        <Button variant="outline" size="default" className="w-full mt-4 min-h-[44px]" asChild>
          <Link href={`/bill/${bill.id}`} data-testid={`button-view-details-${bill.id}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
