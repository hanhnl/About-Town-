import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building,
  Landmark
} from "lucide-react";

interface Representative {
  id: number;
  name: string;
  initials: string;
  party: string;
  district: string;
  chamber?: string;
  termEnd: string;
  email: string | null;
  phone: string | null;
  website?: string | null;
  bio: string;
  photoUrl: string | null;
  isLiveData?: boolean;
}

export function FindYourRep() {
  const [zipcode, setZipcode] = useState("20902");
  const [expandedRep, setExpandedRep] = useState<number | null>(null);
  const [chamberFilter, setChamberFilter] = useState<"all" | "Senate" | "House">("all");

  const { data: representatives = [], isLoading } = useQuery<Representative[]>({
    queryKey: ["/api/representatives"],
  });

  // Filter by chamber
  const filteredReps = representatives.filter(rep => {
    if (chamberFilter === "all") return true;
    return rep.chamber === chamberFilter;
  });

  // Count by chamber
  const senateCount = representatives.filter(r => r.chamber === "Senate").length;
  const houseCount = representatives.filter(r => r.chamber === "House").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            Maryland State Legislators
          </CardTitle>
          {representatives.length > 0 && representatives[0]?.isLiveData && (
            <Badge variant="outline" className="text-xs gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live Data
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter ZIP code to find your district..."
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="pl-9"
              data-testid="input-rep-zipcode"
            />
          </div>
          <Button data-testid="button-find-reps">
            Find My Reps
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-4" onValueChange={(v) => setChamberFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All ({representatives.length})
            </TabsTrigger>
            <TabsTrigger value="Senate" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Senate ({senateCount})
            </TabsTrigger>
            <TabsTrigger value="House" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              House ({houseCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading legislators...</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredReps.map((rep) => (
              <div 
                key={rep.id} 
                className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                data-testid={`rep-card-${rep.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-muted">
                      {rep.photoUrl ? (
                        <AvatarImage src={rep.photoUrl} alt={rep.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {rep.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{rep.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            rep.party === 'Democrat' 
                              ? 'bg-blue-500/10 text-blue-700 border-blue-300' 
                              : rep.party === 'Republican'
                              ? 'bg-red-500/10 text-red-700 border-red-300'
                              : ''
                          }`}
                        >
                          {rep.party === 'Democrat' ? 'D' : rep.party === 'Republican' ? 'R' : rep.party}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {rep.chamber}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rep.district}</p>
                      {rep.email && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{rep.email}</p>
                      )}
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
                          {rep.phone}
                        </a>
                      </Button>
                    )}
                    {rep.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={rep.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Official Bio
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedRep(expandedRep === rep.id ? null : rep.id)}
                      data-testid={`button-expand-${rep.id}`}
                    >
                      {expandedRep === rep.id ? (
                        <>Less <ChevronUp className="h-4 w-4 ml-1" /></>
                      ) : (
                        <>More <ChevronDown className="h-4 w-4 ml-1" /></>
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

                    <div className="text-xs text-muted-foreground">
                      <p className="mb-2">
                        For campaign finance records, visit the official Maryland database:
                      </p>
                      <a 
                        href="https://campaignfinance.maryland.gov/public/cf/contribution"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on MDCRIS
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Data from Maryland General Assembly via LegiScan • 2026 Regular Session
        </p>
      </CardContent>
    </Card>
  );
}
