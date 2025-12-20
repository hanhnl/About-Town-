import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  MessageSquare,
  Users
} from "lucide-react";

interface NeighborhoodVote {
  neighborhood: string;
  support: number;
  oppose: number;
  unsure: number;
  totalVotes: number;
  topComment?: string;
}

interface NeighborhoodSentimentProps {
  neighborhoods: NeighborhoodVote[];
  totalVotes: number;
  overallSupport: number;
  overallOppose: number;
  overallUnsure: number;
}

// todo: remove mock functionality
export const mockSentimentData: NeighborhoodSentimentProps = {
  totalVotes: 342,
  overallSupport: 58,
  overallOppose: 27,
  overallUnsure: 15,
  neighborhoods: [
    {
      neighborhood: "Silver Spring",
      support: 72,
      oppose: 18,
      unsure: 10,
      totalVotes: 89,
      topComment: "Finally, some action on housing!",
    },
    {
      neighborhood: "Forest Glen",
      support: 61,
      oppose: 28,
      unsure: 11,
      totalVotes: 67,
      topComment: "Concerned about parking but overall supportive",
    },
    {
      neighborhood: "Wheaton",
      support: 55,
      oppose: 32,
      unsure: 13,
      totalVotes: 54,
      topComment: "Hope this doesn't increase traffic too much",
    },
    {
      neighborhood: "Takoma Park",
      support: 68,
      oppose: 22,
      unsure: 10,
      totalVotes: 45,
      topComment: "Love the bike lanes addition",
    },
    {
      neighborhood: "Langley Park",
      support: 42,
      oppose: 38,
      unsure: 20,
      totalVotes: 38,
    },
    {
      neighborhood: "Hillandale",
      support: 48,
      oppose: 35,
      unsure: 17,
      totalVotes: 29,
    },
  ],
};

export function NeighborhoodSentiment({ 
  neighborhoods, 
  totalVotes,
  overallSupport,
  overallOppose,
  overallUnsure
}: NeighborhoodSentimentProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            Your Neighbors Say...
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {totalVotes} votes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Overall Community Sentiment</h4>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-primary">
              <ThumbsUp className="h-4 w-4" />
              <span className="font-semibold">{overallSupport}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-destructive">
              <ThumbsDown className="h-4 w-4" />
              <span className="font-semibold">{overallOppose}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span className="font-semibold">{overallUnsure}%</span>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex">
            <div 
              className="bg-primary h-full" 
              style={{ width: `${overallSupport}%` }}
            />
            <div 
              className="bg-destructive h-full" 
              style={{ width: `${overallOppose}%` }}
            />
            <div 
              className="bg-muted-foreground/50 h-full" 
              style={{ width: `${overallUnsure}%` }}
            />
          </div>
        </div>

        <h4 className="text-sm font-medium text-muted-foreground mb-3">By Neighborhood</h4>
        <div className="space-y-4">
          {neighborhoods.map((n, i) => (
            <div 
              key={i} 
              className="p-3 rounded-lg border bg-card"
              data-testid={`sentiment-${n.neighborhood.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="font-medium text-foreground">{n.neighborhood}</span>
                <span className="text-xs text-muted-foreground">{n.totalVotes} votes</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm mb-2">
                <span className="text-primary">{n.support}% support</span>
                <span className="text-destructive">{n.oppose}% oppose</span>
              </div>
              
              <div className="h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-primary h-full" 
                  style={{ width: `${n.support}%` }}
                />
                <div 
                  className="bg-destructive h-full" 
                  style={{ width: `${n.oppose}%` }}
                />
                <div 
                  className="bg-muted h-full" 
                  style={{ width: `${n.unsure}%` }}
                />
              </div>

              {n.topComment && (
                <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="italic">"{n.topComment}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
