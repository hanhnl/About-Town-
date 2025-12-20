import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ImpactResult {
  type: "positive" | "negative" | "neutral" | "info";
  title: string;
  description: string;
}

interface ImpactAnalysisProps {
  billId: string;
  billTitle: string;
}

export function ImpactAnalysis({ billId, billTitle }: ImpactAnalysisProps) {
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ImpactResult[] | null>(null);

  const handleAnalyze = () => {
    if (!address.trim()) return;

    setIsAnalyzing(true);
    // todo: remove mock functionality - integrate with AI analysis
    setTimeout(() => {
      setResults([
        {
          type: "positive",
          title: "Zoning Change Applies",
          description: "Your property at this address is within the University Boulevard Corridor and would be eligible for the new duplex/triplex conversion option.",
        },
        {
          type: "info",
          title: "New Bike Lane Access",
          description: "A protected bike lane will be added within 0.3 miles of your address, improving cycling infrastructure in your area.",
        },
        {
          type: "neutral",
          title: "No Change to Property Tax",
          description: "This bill does not directly affect property tax rates. However, increased development may affect assessed values over time.",
        },
        {
          type: "negative",
          title: "Increased Construction Activity",
          description: "Expect temporary construction activity in your area as infrastructure improvements are implemented over the next 18-24 months.",
        },
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getIcon = (type: ImpactResult["type"]) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-chart-1" />;
      case "negative":
        return <AlertTriangle className="h-5 w-5 text-accent" />;
      case "neutral":
        return <Info className="h-5 w-5 text-muted-foreground" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBadgeClass = (type: ImpactResult["type"]) => {
    switch (type) {
      case "positive":
        return "bg-chart-1/10 text-chart-1 border-chart-1/30";
      case "negative":
        return "bg-accent/10 text-accent border-accent/30";
      case "neutral":
        return "bg-muted text-muted-foreground border-border";
      case "info":
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-accent" />
          <h3 className="text-xl font-medium text-foreground">
            How Does This Affect You?
          </h3>
          <Badge variant="outline" className="ml-2 text-xs">AI-Powered</Badge>
        </div>

        <p className="text-base text-muted-foreground mb-6">
          Enter your address to see a personalized analysis of how this bill may impact your property and neighborhood.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Enter your address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-11 h-12 text-lg"
              data-testid="input-address"
            />
          </div>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!address.trim() || isAnalyzing}
            className="shrink-0"
            data-testid="button-analyze"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Impact
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4" data-testid="impact-results">
            <p className="text-sm text-muted-foreground">
              Analysis based on: <strong>{address}</strong>
            </p>
            {results.map((result, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border"
                data-testid={`impact-result-${index}`}
              >
                <div className="shrink-0 mt-0.5">{getIcon(result.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{result.title}</h4>
                    <Badge variant="outline" className={`text-xs ${getBadgeClass(result.type)}`}>
                      {result.type === "positive" ? "Benefit" : 
                       result.type === "negative" ? "Impact" :
                       result.type === "info" ? "Info" : "Neutral"}
                    </Badge>
                  </div>
                  <p className="text-base text-muted-foreground">{result.description}</p>
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground italic">
              This analysis is generated by AI and should be verified with official documents. 
              For authoritative information, consult the full bill text or contact your local council office.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
