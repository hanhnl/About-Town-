import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, ExternalLink, User } from "lucide-react";

interface SponsorContactProps {
  name: string;
  title?: string;
  district?: string;
  party?: string;
  email?: string;
  phone?: string;
  website?: string;
  cosponsors?: string[];
}

export function SponsorContact({
  name,
  title = "Council Member",
  district = "District 1",
  party = "Democratic",
  email = "councilmember@example.gov",
  phone = "(240) 777-0001",
  website,
  cosponsors = [],
}: SponsorContactProps) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-foreground">{name}</span>
              <Badge variant="outline" className="text-xs">{party}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {title} - {district}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${email}`} data-testid="button-sponsor-email">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${phone}`} data-testid="button-sponsor-phone">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </a>
              </Button>
              {website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {cosponsors.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">Co-sponsors:</span>
              <span>{cosponsors.join(", ")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
