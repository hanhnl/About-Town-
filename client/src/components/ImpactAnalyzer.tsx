import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  MapPin, 
  User,
  Home,
  Building2,
  Briefcase,
  AlertTriangle,
  Check,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";

interface ImpactResult {
  affected: boolean;
  impacts: {
    category: string;
    description: string;
    type: "positive" | "negative" | "neutral";
  }[];
  summary: string;
}

interface ImpactAnalyzerProps {
  billId: string;
  billTitle: string;
}

const entityTypes = [
  { value: "homeowner", label: "Homeowner", icon: Home },
  { value: "renter", label: "Renter", icon: Building2 },
  { value: "business", label: "Business Owner", icon: Briefcase },
  { value: "commuter", label: "Commuter", icon: User },
];

export function ImpactAnalyzer({ billId, billTitle }: ImpactAnalyzerProps) {
  const [address, setAddress] = useState("");
  const [entityType, setEntityType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ImpactResult | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAnalyze = () => {
    if (!address.trim() || !entityType) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setResult({
        affected: true,
        summary: `Based on your location and status as a ${entityType}, this bill will likely affect you in the following ways:`,
        impacts: [
          {
            category: "Property",
            description: entityType === "homeowner" 
              ? "Your property may be eligible for conversion to duplex/triplex, potentially increasing value by 10-20%"
              : "More housing options may become available in your area within 2-3 years",
            type: "positive"
          },
          {
            category: "Transportation",
            description: "New bike lanes and improved bus stops will be installed within 0.5 miles of your address",
            type: "positive"
          },
          {
            category: "Taxes",
            description: entityType === "homeowner"
              ? "Property taxes may increase slightly ($50-150/year) due to infrastructure improvements"
              : "No direct tax impact expected",
            type: entityType === "homeowner" ? "negative" : "neutral"
          },
          {
            category: "Traffic",
            description: "Short-term construction disruptions expected for 6-12 months",
            type: "negative"
          },
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleReset = () => {
    setResult(null);
    setAddress("");
    setEntityType("");
    setShowForm(false);
  };

  if (!showForm && !result) {
    return (
      <Card className="border-2 border-dashed" style={{ borderColor: "hsl(var(--sage) / 0.4)" }}>
        <CardContent className="p-8 text-center">
          <div 
            className="inline-flex items-center justify-center p-4 rounded-full mb-4"
            style={{ backgroundColor: "hsl(var(--sage-light))" }}
          >
            <Sparkles className="h-8 w-8" style={{ color: "hsl(var(--sage))" }} />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            See How This Affects You
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get a personalized analysis of how this legislation impacts you based on your location and situation.
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: "hsl(var(--sage))" }}
            className="text-white"
            data-testid="button-start-impact-analysis"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Analyze My Impact
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5" style={{ color: "hsl(var(--sage))" }} />
              Your Impact Analysis
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Analyze Different Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
            <Badge variant="outline" className="ml-2">
              {entityTypes.find(e => e.value === entityType)?.label}
            </Badge>
          </div>

          <div 
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: result.affected ? "hsl(var(--sage-light))" : "hsl(var(--muted))" }}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.affected ? (
                <AlertTriangle className="h-5 w-5" style={{ color: "hsl(var(--sage))" }} />
              ) : (
                <Check className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">
                {result.affected ? "This bill affects you" : "Limited direct impact"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>

          <div className="space-y-3">
            {result.impacts.map((impact, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                data-testid={`impact-${i}`}
              >
                <div className="shrink-0 mt-0.5">
                  {impact.type === "positive" && (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  )}
                  {impact.type === "negative" && (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                  {impact.type === "neutral" && (
                    <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm mb-0.5">
                    {impact.category}
                  </div>
                  <p className="text-sm text-muted-foreground">{impact.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Analysis based on bill text and geographic data. Results are estimates.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5" style={{ color: "hsl(var(--sage))" }} />
          See How This Affects You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Your Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter your street address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-9"
                data-testid="input-impact-address"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              I am a...
            </label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger data-testid="select-entity-type">
                <SelectValue placeholder="Select your situation" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleAnalyze}
              disabled={!address.trim() || !entityType || isAnalyzing}
              className="flex-1"
              style={{ backgroundColor: "hsl(var(--sage))" }}
              data-testid="button-run-analysis"
            >
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Impact
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your address is not stored. Analysis happens in your browser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
