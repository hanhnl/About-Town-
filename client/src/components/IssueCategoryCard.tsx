import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { type Topic, getTopicLabel, getTopicIcon } from "./TopicBadge";
import { ChevronRight } from "lucide-react";

interface IssueCategoryCardProps {
  topic: Topic;
  billCount: number;
  description: string;
}

export function IssueCategoryCard({ topic, billCount, description }: IssueCategoryCardProps) {
  const Icon = getTopicIcon(topic);
  const label = getTopicLabel(topic);

  return (
    <Link href={`/dashboard?topic=${topic}`}>
      <Card
        className="hover-elevate active-elevate-2 cursor-pointer h-full"
        data-testid={`card-issue-${topic}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-medium text-foreground" data-testid={`text-issue-title-${topic}`}>
                  {label}
                </h3>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-issue-description-${topic}`}>
                {description}
              </p>
              <p className="text-sm font-medium text-primary" data-testid={`text-issue-count-${topic}`}>
                {billCount} {billCount === 1 ? "bill" : "bills"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
