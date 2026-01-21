import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { CouncilMember, CampaignContribution } from "@shared/schema";
import { 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Minus,
  DollarSign,
  Vote,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle
} from "lucide-react";

export function FindYourRep() {
  const [zipcode, setZipcode] = useState("20902");
  const [showReps, setShowReps] = useState(true);
  const [expandedRep, setExpandedRep] = useState<number | null>(null);

  const { data: representatives = [], isLoading } = useQuery<CouncilMember[]>({
    queryKey: ["/api/representatives"],
  });

  const { data: contributions = [] } = useQuery<CampaignContribution[]>({
    queryKey: ["/api/representatives", expandedRep, "contributions"],
    enabled: expandedRep !== null,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-5 w-5 text-primary" />
          Your Representatives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter ZIP code..."
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="pl-9"
              data-testid="input-rep-zipcode"
            />
          </div>
          <Button 
            onClick={() => setShowReps(true)}
            data-testid="button-find-reps"
          >
            Find Reps
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading representatives...</p>
          </div>
        )}

        {showReps && !isLoading && (
          <div className="space-y-4">
            {(representatives || []).map((rep) => (
              <div 
                key={rep.id} 
                className="border rounded-lg overflow-hidden"
                data-testid={`rep-card-${rep.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {rep.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{rep.name}</h3>
                        <Badge variant="outline" className="text-xs">{rep.party}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Council Member - {rep.district}</p>
                      <p className="text-xs text-muted-foreground mt-1">Term ends: {rep.termEnd}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {rep.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${rep.email}`} data-testid={`button-email-${rep.id}`}>
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </a>
                      </Button>
                    )}
                    {rep.phone && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${rep.phone}`} data-testid={`button-phone-${rep.id}`}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://www.montgomerycountymd.gov/council/`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedRep(expandedRep === rep.id ? null : rep.id)}
                      data-testid={`button-expand-${rep.id}`}
                    >
                      {expandedRep === rep.id ? (
                        <>Less Info <ChevronUp className="h-4 w-4 ml-1" /></>
                      ) : (
                        <>More Info <ChevronDown className="h-4 w-4 ml-1" /></>
                      )}
                    </Button>
                  </div>
                </div>

                {expandedRep === rep.id && (
                  <div className="border-t bg-muted/30 p-4 space-y-4">
                    {rep.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">About</h4>
                        <p className="text-sm text-muted-foreground">{rep.bio}</p>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" style={{ color: "hsl(var(--sage))" }} />
                          Campaign Contributions (2022 Cycle)
                        </h4>
                        <Badge variant="outline" className="text-xs gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700">
                          <AlertCircle className="h-3 w-3" />
                          Sample Data
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {contributions
                          .filter(c => c.councilMemberId === rep.id)
                          .map((contribution, i) => (
                            <div 
                              key={i} 
                              className="flex items-center justify-between text-sm"
                              data-testid={`contribution-${rep.id}-${i}`}
                            >
                              <span className="text-muted-foreground">{contribution.donorCategory}</span>
                              <span className="font-medium text-foreground">
                                ${contribution.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                      <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                        <p className="mb-2">
                          This is illustrative sample data. For real campaign finance records, visit the official Maryland database:
                        </p>
                        <a 
                          href="https://campaignfinance.maryland.gov/public/cf/contribution"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Real Data on MDCRIS (2.4M+ records)
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
