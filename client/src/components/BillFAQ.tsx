import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  helpful: number;
  notHelpful: number;
  source?: string;
}

interface BillFAQProps {
  faqs: FAQItem[];
  billId: string;
}

// todo: remove mock functionality
export const mockFAQs: FAQItem[] = [
  {
    id: "1",
    question: "Will this bill increase my property taxes?",
    answer: "Not directly. This bill rezones land use but does not change tax rates. However, property values in the corridor may increase due to new development potential, which could affect assessments over time. The fiscal analysis estimates property tax revenue may increase by $450K annually from new development.",
    helpful: 45,
    notHelpful: 3,
    source: "Fiscal Impact Statement, p. 12",
  },
  {
    id: "2",
    question: "Can I still keep my single-family home?",
    answer: "Yes. This bill allows but does not require homeowners to convert their properties. You can keep your home exactly as it is. The zoning change simply gives you the option to add a unit or convert to a duplex/triplex if you choose to in the future.",
    helpful: 67,
    notHelpful: 2,
    source: "Bill Summary, Section 4.2",
  },
  {
    id: "3",
    question: "When will the bike lanes be built?",
    answer: "The bill authorizes bike lane construction but doesn't set a specific timeline. Based on similar projects, implementation typically takes 18-24 months after funding is allocated. The Transportation Department will publish a detailed schedule once the bill is enacted.",
    helpful: 32,
    notHelpful: 5,
    source: "Staff Report, Infrastructure Section",
  },
  {
    id: "4",
    question: "How will this affect traffic and parking?",
    answer: "The bill reduces parking requirements from 2 spaces to 0.5 spaces per unit for new development. Traffic studies project a 12% increase in corridor traffic over 10 years, but new transit improvements are expected to offset some vehicle trips. The bill also funds traffic signal upgrades.",
    helpful: 28,
    notHelpful: 8,
    source: "Traffic Impact Analysis",
  },
  {
    id: "5",
    question: "Will there be affordable housing?",
    answer: "Yes. New developments over 20 units must include 15% affordable units priced for households earning 60% of Area Median Income. For a family of 4, this means rent would be capped at approximately $1,400/month for qualifying units.",
    helpful: 51,
    notHelpful: 4,
    source: "Bill Text, Section 7.1",
  },
];

export function BillFAQ({ faqs, billId }: BillFAQProps) {
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, "up" | "down" | null>>({});

  const handleVote = (faqId: string, vote: "up" | "down") => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: prev[faqId] === vote ? null : vote,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-primary" />
            Common Questions
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              data-testid={`faq-item-${faq.id}`}
            >
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-2">
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    {faq.answer}
                  </p>
                  
                  {faq.source && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Source: {faq.source}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Was this helpful?</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={helpfulVotes[faq.id] === "up" ? "text-primary" : ""}
                        onClick={() => handleVote(faq.id, "up")}
                        data-testid={`faq-helpful-${faq.id}`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {faq.helpful + (helpfulVotes[faq.id] === "up" ? 1 : 0)}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={helpfulVotes[faq.id] === "down" ? "text-destructive" : ""}
                        onClick={() => handleVote(faq.id, "down")}
                        data-testid={`faq-not-helpful-${faq.id}`}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {faq.notHelpful + (helpfulVotes[faq.id] === "down" ? 1 : 0)}
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Have a question not answered here? Ask in the comments section below.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
