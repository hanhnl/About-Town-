import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Home, 
  Briefcase, 
  GraduationCap,
  Heart,
  MapPin
} from "lucide-react";

interface DemographicGroup {
  id: string;
  name: string;
  icon: "age" | "income" | "housing" | "employment" | "education" | "location";
  count: string;
  impact: "positive" | "negative" | "mixed" | "neutral";
  description: string;
}

interface DemographicsAffectedProps {
  groups: DemographicGroup[];
  totalResidentsAffected: string;
}

const iconMap = {
  age: Heart,
  income: Briefcase,
  housing: Home,
  employment: Briefcase,
  education: GraduationCap,
  location: MapPin,
};

// todo: remove mock functionality
export const mockDemographicsData: DemographicsAffectedProps = {
  totalResidentsAffected: "~45,000",
  groups: [
    {
      id: "1",
      name: "Renters",
      icon: "housing",
      count: "18,000",
      impact: "positive",
      description: "More housing options and potentially lower rents from increased supply",
    },
    {
      id: "2",
      name: "Homeowners (corridor)",
      icon: "housing",
      count: "8,500",
      impact: "mixed",
      description: "Property values may increase; some may have concerns about neighborhood changes",
    },
    {
      id: "3",
      name: "Young families",
      icon: "age",
      count: "12,000",
      impact: "positive",
      description: "More affordable housing options near schools and transit",
    },
    {
      id: "4",
      name: "Seniors (65+)",
      icon: "age",
      count: "9,200",
      impact: "positive",
      description: "Improved sidewalks and transit access; more housing choices to age in place",
    },
    {
      id: "5",
      name: "Small business owners",
      icon: "employment",
      count: "1,200",
      impact: "positive",
      description: "More customers from increased residential density along corridor",
    },
    {
      id: "6",
      name: "Low-income households",
      icon: "income",
      count: "6,800",
      impact: "positive",
      description: "Affordable housing requirements in new developments",
    },
  ],
};

const impactColors = {
  positive: "bg-primary/10 text-primary border-primary/20",
  negative: "bg-destructive/10 text-destructive border-destructive/20",
  mixed: "bg-accent/10 text-accent border-accent/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const impactLabels = {
  positive: "Positive Impact",
  negative: "Negative Impact",
  mixed: "Mixed Impact",
  neutral: "Minimal Impact",
};

export function DemographicsAffected({ groups, totalResidentsAffected }: DemographicsAffectedProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            Who Is Affected
          </CardTitle>
          <Badge variant="outline" className="text-base">
            {totalResidentsAffected} residents
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((group) => {
            const Icon = iconMap[group.icon];
            return (
              <div 
                key={group.id}
                className={`p-4 rounded-lg border ${impactColors[group.impact]}`}
                data-testid={`demographic-${group.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-background shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-foreground">{group.name}</h4>
                      <span className="text-sm font-medium">{group.count}</span>
                    </div>
                    <p className="text-sm opacity-80">{group.description}</p>
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-xs"
                    >
                      {impactLabels[group.impact]}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
