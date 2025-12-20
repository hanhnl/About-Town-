import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Clock, 
  ExternalLink,
  Database,
  FileCheck
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataSource {
  name: string;
  url?: string;
  lastUpdated?: string;
}

interface DataTransparencyProps {
  sources: DataSource[];
  lastUpdated: string;
  compact?: boolean;
}

export function DataTransparency({ sources, lastUpdated, compact = false }: DataTransparencyProps) {
  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" data-testid="button-about-data">
            <Info className="h-4 w-4" />
            About this data
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last updated:</span>
              <span className="font-medium text-foreground">{lastUpdated}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Data Sources:</span>
              </div>
              <ul className="space-y-1.5">
                {sources.map((source, i) => (
                  <li key={i} className="text-sm">
                    {source.url ? (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        {source.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{source.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <FileCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
              <h4 className="font-medium text-foreground">About This Data</h4>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated {lastUpdated}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {sources.map((source, i) => (
                <span key={i} className="text-sm">
                  {source.url ? (
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {source.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{source.name}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const defaultDataSources = [
  { name: "Montgomery County Council", url: "https://www.montgomerycountymd.gov/council/" },
  { name: "MD General Assembly", url: "https://mgaleg.maryland.gov/" },
  { name: "County Budget Office" },
];
