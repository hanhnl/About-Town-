import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Newspaper, Calendar } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  excerpt?: string;
}

interface RelatedNewsProps {
  articles: NewsArticle[];
}

// todo: remove mock functionality
export const mockNewsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Council Approves Major Zoning Overhaul for University Boulevard",
    source: "Montgomery County Sentinel",
    date: "Dec 9, 2025",
    url: "#",
    excerpt: "The new plan will allow for increased housing density and improved transit options...",
  },
  {
    id: "2",
    title: "Residents React to Proposed Changes: Mixed Feelings on Growth",
    source: "Bethesda Magazine",
    date: "Dec 5, 2025",
    url: "#",
    excerpt: "Long-time residents express concerns while housing advocates celebrate...",
  },
  {
    id: "3",
    title: "What the Corridor Plan Means for Property Owners",
    source: "Washington Post Local",
    date: "Dec 3, 2025",
    url: "#",
  },
];

export function RelatedNews({ articles }: RelatedNewsProps) {
  if (articles.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Newspaper className="h-5 w-5 text-primary" />
          Related News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <a 
              key={article.id} 
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-muted/50 hover-elevate"
              data-testid={`news-article-${article.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground leading-snug mb-1">
                    {article.title}
                  </h4>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{article.source}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
