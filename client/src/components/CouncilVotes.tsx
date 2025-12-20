import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, HelpCircle, Users } from "lucide-react";

export interface CouncilMemberVote {
  id: string;
  name: string;
  initials: string;
  district: string;
  vote: "yes" | "no" | "uncertain" | "abstain";
}

interface CouncilVotesProps {
  votes: CouncilMemberVote[];
}

const voteConfig = {
  yes: { label: "Yes", icon: Check, className: "bg-chart-1/10 text-chart-1 border-chart-1/30" },
  no: { label: "No", icon: X, className: "bg-destructive/10 text-destructive border-destructive/30" },
  uncertain: { label: "Uncertain", icon: HelpCircle, className: "bg-muted text-muted-foreground border-border" },
  abstain: { label: "Abstain", icon: HelpCircle, className: "bg-muted text-muted-foreground border-border" },
};

export function CouncilVotes({ votes }: CouncilVotesProps) {
  const yesVotes = votes.filter((v) => v.vote === "yes").length;
  const noVotes = votes.filter((v) => v.vote === "no").length;
  const uncertainVotes = votes.filter((v) => v.vote === "uncertain" || v.vote === "abstain").length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-muted-foreground" />
          <h3 className="text-xl font-medium text-foreground">
            Council Member Votes
          </h3>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-chart-1" />
            <span className="text-lg font-medium text-foreground">{yesVotes} Yes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive" />
            <span className="text-lg font-medium text-foreground">{noVotes} No</span>
          </div>
          {uncertainVotes > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-muted-foreground" />
              <span className="text-lg font-medium text-foreground">{uncertainVotes} Uncertain/Abstain</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {votes.map((member) => {
            const config = voteConfig[member.vote];
            const Icon = config.icon;

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
                data-testid={`council-vote-${member.id}`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs font-medium">{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-medium text-foreground text-sm" data-testid={`text-council-name-${member.id}`}>
                      {member.name}
                    </p>
                    <Badge variant="outline" className={`shrink-0 gap-1 text-xs ${config.className}`}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {member.district}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
