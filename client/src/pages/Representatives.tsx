import { useState } from "react";
import { FindYourRep } from "@/components/FindYourRep";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DataTransparency, defaultDataSources } from "@/components/DataTransparency";
import { 
  Users, 
  Vote, 
  DollarSign, 
  Building2,
  Briefcase,
  HardHat,
  Handshake,
  Heart,
  PieChart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface CampaignDonor {
  category: string;
  icon: typeof Building2;
  amount: number;
  percentage: number;
  color: string;
}

const mockCampaignAnalysis: CampaignDonor[] = [
  { category: "Real Estate / Developers", icon: Building2, amount: 245000, percentage: 32, color: "bg-blue-500" },
  { category: "Labor Unions", icon: Handshake, amount: 178000, percentage: 23, color: "bg-emerald-500" },
  { category: "Small Businesses", icon: Briefcase, amount: 142000, percentage: 18, color: "bg-amber-500" },
  { category: "Individual Contributors", icon: Heart, amount: 120000, percentage: 16, color: "bg-rose-500" },
  { category: "Construction", icon: HardHat, amount: 85000, percentage: 11, color: "bg-slate-500" },
];

export default function Representatives() {
  const [showFundingAnalysis, setShowFundingAnalysis] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: "Your Representatives" }]} />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Your Representatives
          </h1>
          <p className="text-xl text-muted-foreground">
            Find who represents you based on your ZIP code, see how they vote, and follow the money.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">9</div>
                <div className="text-sm text-muted-foreground">Council Members</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Vote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">47</div>
                <div className="text-sm text-muted-foreground">Votes This Year</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--sage-light))" }}>
                <DollarSign className="h-5 w-5" style={{ color: "hsl(var(--sage))" }} />
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">$2.1M</div>
                <div className="text-sm text-muted-foreground">Campaign Funds</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <FindYourRep />

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <PieChart className="h-5 w-5" style={{ color: "hsl(var(--sage))" }} />
                  Campaign Funding Analysis
                </CardTitle>
                <Badge variant="outline" className="text-xs gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700">
                  <AlertCircle className="h-3 w-3" />
                  Sample Data
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFundingAnalysis(!showFundingAnalysis)}
                data-testid="button-toggle-funding"
              >
                {showFundingAnalysis ? (
                  <>Hide Details <ChevronUp className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Show Details <ChevronDown className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Illustrative breakdown of campaign contributions by category.
              See who typically funds local government.
            </p>
            
            {showFundingAnalysis && (
              <div className="space-y-4">
                {mockCampaignAnalysis.map((donor, i) => (
                  <div key={i} className="space-y-2" data-testid={`funding-category-${i}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <donor.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground text-sm">{donor.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{donor.percentage}%</Badge>
                        <span className="text-sm text-muted-foreground w-24 text-right">
                          ${donor.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress value={donor.percentage} className="h-2" />
                  </div>
                ))}
                
                <div className="mt-6 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">
                    This is sample data for demonstration. For real campaign finance records:
                  </p>
                  <a 
                    href="https://campaignfinance.maryland.gov/public/cf/contribution"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Real Data on MDCRIS (2.4M+ records)
                  </a>
                </div>
              </div>
            )}

            {!showFundingAnalysis && (
              <div className="flex flex-wrap gap-2">
                {mockCampaignAnalysis.slice(0, 3).map((donor, i) => (
                  <Badge key={i} variant="outline" className="gap-1.5">
                    <donor.icon className="h-3 w-3" />
                    {donor.category}: {donor.percentage}%
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <DataTransparency 
            sources={[
              ...defaultDataSources,
              { name: "MD State Board of Elections", url: "https://elections.maryland.gov/" }
            ]}
            lastUpdated="2 hours ago"
          />
        </div>
      </div>
    </div>
  );
}
