import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Database, 
  ExternalLink,
  AlertCircle 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DataSourceType = 'live' | 'official' | 'sample' | 'curated';

interface DataSourceBadgeProps {
  type: DataSourceType;
  sourceName?: string;
  sourceUrl?: string;
  showTooltip?: boolean;
}

const badgeConfig: Record<DataSourceType, {
  label: string;
  icon: typeof CheckCircle2;
  className: string;
  tooltip: string;
}> = {
  live: {
    label: 'Live Data',
    icon: CheckCircle2,
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
    tooltip: 'This data is fetched directly from official government APIs in real-time.',
  },
  official: {
    label: 'Official',
    icon: Database,
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    tooltip: 'This data comes from official government records.',
  },
  sample: {
    label: 'Sample Data',
    icon: AlertCircle,
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    tooltip: 'This is illustrative sample data for demonstration purposes.',
  },
  curated: {
    label: 'Curated',
    icon: CheckCircle2,
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
    tooltip: 'This data is manually curated from official sources.',
  },
};

export function DataSourceBadge({ 
  type, 
  sourceName, 
  sourceUrl,
  showTooltip = true 
}: DataSourceBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant="outline" 
      className={`text-xs gap-1 ${config.className}`}
      data-testid={`badge-data-source-${type}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
      {sourceUrl && (
        <a 
          href={sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-0.5"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{config.tooltip}</p>
        {sourceName && (
          <p className="text-xs text-muted-foreground mt-1">
            Source: {sourceName}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Component for showing data source info in a more detailed format
interface DataSourceInfoProps {
  sources: {
    name: string;
    type: DataSourceType;
    url?: string;
    note?: string;
  }[];
}

export function DataSourceInfo({ sources }: DataSourceInfoProps) {
  return (
    <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
      <p className="font-medium text-foreground mb-2">Data Sources:</p>
      {sources.map((source, index) => (
        <div key={index} className="flex items-start gap-2">
          <DataSourceBadge type={source.type} showTooltip={false} />
          <div>
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
              <span>{source.name}</span>
            )}
            {source.note && (
              <p className="text-muted-foreground mt-0.5">{source.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
