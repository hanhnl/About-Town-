import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  Home,
  Users,
  AlertTriangle,
  Check
} from "lucide-react";

interface TaxImpact {
  bracket: string;
  annualChange: number;
  percentChange: number;
}

interface NeighborhoodImpact {
  affected: boolean;
  distance: string;
  impacts: string[];
}

interface BeforeAfterChange {
  category: string;
  before: string;
  after: string;
  impact: "positive" | "negative" | "neutral";
}

interface HowThisAffectsYouProps {
  billId: string;
  billTitle: string;
}

// todo: remove mock functionality - integrate with backend
const mockTaxImpacts: TaxImpact[] = [
  { bracket: "Under $50,000", annualChange: -45, percentChange: -0.09 },
  { bracket: "$50,000 - $100,000", annualChange: 120, percentChange: 0.12 },
  { bracket: "$100,000 - $200,000", annualChange: 280, percentChange: 0.14 },
  { bracket: "Over $200,000", annualChange: 450, percentChange: 0.15 },
];

const mockBeforeAfter: BeforeAfterChange[] = [
  {
    category: "Zoning",
    before: "Single-family only",
    after: "Allows duplexes and triplexes",
    impact: "positive",
  },
  {
    category: "Building Height",
    before: "35 feet maximum",
    after: "45 feet maximum",
    impact: "neutral",
  },
  {
    category: "Parking Requirements",
    before: "2 spaces per unit",
    after: "0.5 spaces per unit",
    impact: "positive",
  },
];

export function HowThisAffectsYou({ billId, billTitle }: HowThisAffectsYouProps) {
  const [address, setAddress] = useState("");
  const [neighborhoodImpact, setNeighborhoodImpact] = useState<NeighborhoodImpact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckAddress = () => {
    if (!address.trim()) return;
    setIsLoading(true);
    // todo: remove mock functionality - integrate with backend
    setTimeout(() => {
      setNeighborhoodImpact({
        affected: true,
        distance: "0.3 miles",
        impacts: [
          "Your street is within the rezoning corridor",
          "Property values may increase 5-15%",
          "More housing options could reduce traffic on nearby roads",
          "New bike lanes will be installed on your block",
        ],
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-5 w-5 text-primary" />
          How This Affects You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="location" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="location" data-testid="tab-location">
              <MapPin className="h-4 w-4 mr-2" />
              Your Location
            </TabsTrigger>
            <TabsTrigger value="taxes" data-testid="tab-taxes">
              <DollarSign className="h-4 w-4 mr-2" />
              Tax Impact
            </TabsTrigger>
            <TabsTrigger value="changes" data-testid="tab-changes">
              <TrendingUp className="h-4 w-4 mr-2" />
              Before/After
            </TabsTrigger>
          </TabsList>

          <TabsContent value="location">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Enter your address to see if this bill affects your neighborhood directly.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your street address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1"
                  data-testid="input-affects-address"
                />
                <Button 
                  onClick={handleCheckAddress}
                  disabled={!address.trim() || isLoading}
                  data-testid="button-check-address"
                >
                  {isLoading ? "Checking..." : "Check"}
                </Button>
              </div>

              {neighborhoodImpact && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    {neighborhoodImpact.affected ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-accent" />
                        <span className="font-medium text-foreground">
                          This bill affects your area
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {neighborhoodImpact.distance} from your address
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">
                          Not directly affected
                        </span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {neighborhoodImpact.impacts.map((impact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {impact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Neighborhood Map</span>
                </div>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Interactive map showing affected areas
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="taxes">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Estimated annual tax impact by household income:
              </p>
              <div className="space-y-3">
                {mockTaxImpacts.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`tax-bracket-${i}`}
                  >
                    <span className="font-medium text-foreground">{item.bracket}</span>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${
                        item.annualChange > 0 ? "text-destructive" : "text-primary"
                      }`}>
                        {item.annualChange > 0 ? "+" : ""}${Math.abs(item.annualChange)}/year
                      </span>
                      {item.annualChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Estimates based on fiscal analysis. Actual impact may vary.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="changes">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Key changes if this bill passes:
              </p>
              <div className="space-y-4">
                {mockBeforeAfter.map((change, i) => (
                  <div 
                    key={i} 
                    className="border rounded-lg overflow-hidden"
                    data-testid={`before-after-${i}`}
                  >
                    <div className="px-4 py-2 bg-muted/50 font-medium text-foreground">
                      {change.category}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="p-3 border-r">
                        <div className="text-xs text-muted-foreground mb-1">Before</div>
                        <div className="text-sm text-foreground">{change.before}</div>
                      </div>
                      <div className="p-3 relative">
                        <div className="text-xs text-muted-foreground mb-1">After</div>
                        <div className="text-sm text-foreground">{change.after}</div>
                        {change.impact === "positive" && (
                          <Badge className="absolute top-2 right-2 bg-primary/10 text-primary" variant="outline">
                            Beneficial
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
