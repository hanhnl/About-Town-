import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  FileText, 
  Users, 
  Vote, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming" | "failed";
  type: "introduced" | "committee" | "hearing" | "vote" | "enacted" | "vetoed";
}

interface BillTimelineProps {
  events: TimelineEvent[];
}

const typeIcons = {
  introduced: FileText,
  committee: Users,
  hearing: Users,
  vote: Vote,
  enacted: CheckCircle2,
  vetoed: XCircle,
};

// todo: remove mock functionality
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "1",
    date: "Oct 15, 2025",
    title: "Bill Introduced",
    description: "Introduced by Council Member Williams with 4 co-sponsors",
    status: "completed",
    type: "introduced",
  },
  {
    id: "2",
    date: "Oct 28, 2025",
    title: "Planning Committee Review",
    description: "Referred to Planning, Housing, and Parks Committee",
    status: "completed",
    type: "committee",
  },
  {
    id: "3",
    date: "Nov 10, 2025",
    title: "Public Hearing",
    description: "45 residents testified. 32 in support, 13 opposed",
    status: "completed",
    type: "hearing",
  },
  {
    id: "4",
    date: "Nov 24, 2025",
    title: "Committee Vote",
    description: "Approved by committee 4-1 with amendments",
    status: "completed",
    type: "vote",
  },
  {
    id: "5",
    date: "Dec 8, 2025",
    title: "Full Council Vote",
    description: "Passed 7-2. Now awaits County Executive signature",
    status: "current",
    type: "vote",
  },
  {
    id: "6",
    date: "Dec 22, 2025",
    title: "County Executive Action",
    description: "10-day window to sign or veto",
    status: "upcoming",
    type: "enacted",
  },
];

export function BillTimeline({ events }: BillTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-5 w-5 text-primary" />
          Bill Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
          <div className="space-y-6">
            {events.map((event, index) => {
              const Icon = typeIcons[event.type];
              const isLast = index === events.length - 1;
              
              return (
                <div 
                  key={event.id} 
                  className="relative pl-10"
                  data-testid={`timeline-event-${event.id}`}
                >
                  <div className={`absolute left-0 p-2 rounded-full ${
                    event.status === "completed" 
                      ? "bg-primary text-primary-foreground"
                      : event.status === "current"
                        ? "bg-accent text-accent-foreground"
                        : event.status === "failed"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className={`${
                    event.status === "upcoming" ? "opacity-60" : ""
                  }`}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">
                        {event.date}
                      </span>
                      {event.status === "current" && (
                        <Badge className="bg-accent text-accent-foreground">
                          Current Stage
                        </Badge>
                      )}
                      {event.status === "upcoming" && (
                        <Badge variant="outline">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Timeline updates as the bill progresses. Subscribe to get notified of changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
