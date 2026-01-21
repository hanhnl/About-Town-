import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, ExternalLink, Globe, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, type BillStatus } from "@/components/StatusBadge";
import { TopicBadge, type Topic } from "@/components/TopicBadge";
import { VoteButtons } from "@/components/VoteButtons";
import { CommentSection, type Comment } from "@/components/CommentSection";
import { SignInPrompt } from "@/components/SignInPrompt";
import { CouncilVotes, type CouncilMemberVote } from "@/components/CouncilVotes";
import { BillTimeline, type TimelineEvent, mockTimelineEvents } from "@/components/BillTimeline";
import { NeighborhoodSentiment, mockSentimentData } from "@/components/NeighborhoodSentiment";
import { BillFAQ, mockFAQs } from "@/components/BillFAQ";
import { EngagementTools } from "@/components/EngagementTools";
import { SponsorContact } from "@/components/SponsorContact";
import { RelatedNews, mockNewsArticles } from "@/components/RelatedNews";
import { SocialShare } from "@/components/SocialShare";
import { BillStatusProgress } from "@/components/BillStatusProgress";
import { RelatedBills, mockRelatedBills } from "@/components/RelatedBills";
import { ImpactAnalyzer } from "@/components/ImpactAnalyzer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DataTransparency, defaultDataSources } from "@/components/DataTransparency";
import { PrintEmailActions } from "@/components/PrintEmailActions";
import { BillAmendments, type Amendment } from "@/components/BillAmendments";
import { StarButton } from "@/components/StarButton";
import { useToast } from "@/hooks/use-toast";
import type { Bill, BillTimeline as BillTimelineType, CouncilVote, CouncilMember } from "@shared/schema";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "am", name: "አማርኛ" },
  { code: "fr", name: "Français" },
];

const topicLabels: Record<string, string> = {
  zoning: "Zoning",
  housing: "Housing",
  transportation: "Transportation",
  budget: "Budget",
  education: "Education",
  environment: "Environment",
  "public-safety": "Public Safety",
  "consumer-protection": "Consumer Protection",
};

function mapStatusToStage(status: string): "proposed" | "committee" | "vote" | "passed" | "failed" | "enacted" | "vetoed" {
  switch (status) {
    case "introduced": return "proposed";
    case "in_committee": return "committee";
    case "public_hearing": return "vote";
    case "approved": return "passed";
    case "passed": return "passed";
    case "failed": return "failed";
    case "enacted": return "enacted";
    case "vetoed": return "vetoed";
    default: return "committee";
  }
}

function mapStatusToBillStatus(status: string): BillStatus {
  const statusMap: Record<string, BillStatus> = {
    "introduced": "introduced",
    "in_committee": "in_committee",
    "public_hearing": "active",
    "approved": "passed",
    "enacted": "enacted",
  };
  return statusMap[status] || "active";
}


export default function BillDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState("en");
  const { user, isLoggedIn } = useAuth();
  const userNeighborhood = user?.neighborhood || "Your Neighborhood";
  
  const navigateToSignUp = () => setLocation("/signup");

  const billId = parseInt(params.id || "1");

  const { data: bill, isLoading: billLoading } = useQuery<Bill>({
    queryKey: ["/api/bills", billId],
  });

  const { data: timeline = [] } = useQuery<BillTimelineType[]>({
    queryKey: ["/api/bills", billId, "timeline"],
    enabled: !!bill,
  });

  const { data: councilVotes = [] } = useQuery<(CouncilVote & { councilMember?: CouncilMember })[]>({
    queryKey: ["/api/bills", billId, "votes"],
    enabled: !!bill,
  });

  const { data: backendComments = [] } = useQuery<any[]>({
    queryKey: [`/api/comments?billId=${billId}`],
    enabled: !!bill,
  });

  const { data: amendments = [] } = useQuery<Amendment[]>({
    queryKey: ["/api/bills", billId, "amendments"],
    enabled: !!bill,
  });

  const comments: Comment[] = (backendComments || []).map(c => ({
    id: String(c.id),
    author: c.author,
    authorInitials: c.authorInitials,
    neighborhood: c.neighborhood || "",
    content: c.content,
    timestamp: c.timestamp ? new Date(c.timestamp).toLocaleDateString() : "Recently",
    upvotes: c.upvotes || 0,
  }));

  const timelineEvents: TimelineEvent[] = (timeline || []).map((t, index) => ({
    id: String(t.id || index),
    date: t.date,
    title: t.title,
    description: t.description || "",
    status: (t.status === "complete" ? "completed" : t.status) as "completed" | "current" | "upcoming" | "failed",
    type: (t.type as TimelineEvent["type"]) || "committee",
  }));

  const councilVotesFormatted: CouncilMemberVote[] = (councilVotes || []).map((v) => ({
    id: String(v.id),
    name: v.councilMember?.name || "Unknown",
    initials: v.councilMember?.initials || "??",
    district: v.councilMember?.district || "Unknown",
    vote: v.vote as "yes" | "no" | "uncertain",
  }));

  const handleVote = (vote: "support" | "oppose") => {
    if (!isLoggedIn) {
      navigateToSignUp();
      return;
    }
    toast({
      title: vote === "support" ? "Vote recorded: Support" : "Vote recorded: Oppose",
      description: "Thank you for making your voice heard!",
    });
  };

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("Not logged in");
      const response = await apiRequest("POST", `/api/bills/${billId}/comments`, {
        userId: user.id,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments?billId=${billId}`] });
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to post comment",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (content: string) => {
    if (!isLoggedIn) {
      navigateToSignUp();
      return;
    }
    addCommentMutation.mutate(content);
  };

  const upvoteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("POST", `/api/comments/${commentId}/upvote`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments?billId=${billId}`] });
    },
  });

  const handleUpvote = (commentId: string) => {
    if (!isLoggedIn) return;
    upvoteMutation.mutate(commentId);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    toast({
      title: "Language updated",
      description: "Translation feature coming soon.",
    });
  };

  if (billLoading || !bill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bill details...</p>
        </div>
      </div>
    );
  }

  const displayStatus = mapStatusToBillStatus(bill.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs 
          items={[
            { label: "Bills", href: "/dashboard" },
            { label: topicLabels[bill.topic] || bill.topic, href: `/issues?topic=${bill.topic}` },
            { label: bill.billNumber }
          ]} 
        />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-base" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bills
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px]" data-testid="select-language">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <DataTransparency 
              sources={defaultDataSources}
              lastUpdated="2 hours ago"
              compact
            />
            
            <SocialShare title={bill.title} summary={bill.summary || ""} />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-mono text-muted-foreground" data-testid="text-bill-number">
                {bill.billNumber}
              </span>
              <StatusBadge status={displayStatus} />
              <TopicBadge topic={bill.topic as Topic} />
            </div>
            <StarButton billId={billId} variant="default" size="default" />
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4" data-testid="text-bill-title">
            {bill.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground mb-6">
            {bill.voteDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-5 w-5" />
                <span data-testid="text-vote-date">Vote: {bill.voteDate}</span>
              </div>
            )}
            {bill.sponsorName && (
              <div className="flex items-center gap-1.5">
                <User className="h-5 w-5" />
                <span data-testid="text-sponsor">{bill.sponsorName}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-card rounded-lg border mb-6">
            <BillStatusProgress currentStage={mapStatusToStage(bill.status)} />
          </div>

          <div className="mb-4">
            <PrintEmailActions billTitle={bill.title} billNumber={bill.billNumber} />
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-medium text-foreground mb-4">
              Impact Summary
            </h2>
            <p className="text-xl text-foreground leading-relaxed" data-testid="text-summary">
              {bill.summary}
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <SponsorContact
            name={bill.sponsorName?.replace("Council Member ", "") || "Unknown"}
            cosponsors={bill.cosponsors || undefined}
          />
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                Community Poll
              </h3>
              {isLoggedIn ? (
                <VoteButtons
                  supportCount={bill.supportVotes || 0}
                  opposeCount={bill.opposeVotes || 0}
                  onVote={handleVote}
                />
              ) : (
                <div>
                  <VoteButtons
                    supportCount={bill.supportVotes || 0}
                    opposeCount={bill.opposeVotes || 0}
                    onVote={handleVote}
                    disabled={true}
                  />
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    <Link href="/signup">
                      <span 
                        className="text-primary underline hover:no-underline font-medium cursor-pointer" 
                        data-testid="button-sign-in-vote"
                      >
                        Sign up
                      </span>
                    </Link>
                    {" "}to cast your vote
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <ImpactAnalyzer billId={String(bill.id)} billTitle={bill.title} />
        </div>

        <div className="mb-8">
          <EngagementTools 
            billId={String(bill.id)} 
            billTitle={bill.title} 
            billNumber={bill.billNumber}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <BillTimeline events={timelineEvents.length > 0 ? timelineEvents : mockTimelineEvents} />
          <RelatedBills currentBillId={String(bill.id)} bills={mockRelatedBills} />
        </div>

        <div className="mb-8">
          <BillFAQ faqs={mockFAQs} billId={String(bill.id)} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <CouncilVotes votes={councilVotesFormatted.length > 0 ? councilVotesFormatted : []} />

          {amendments.length > 0 && (
            <BillAmendments amendments={amendments} />
          )}
          <NeighborhoodSentiment {...mockSentimentData} />
        </div>

        <div className="mb-8">
          <RelatedNews articles={mockNewsArticles} />
        </div>

        {bill.fullText && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-medium text-foreground">
                  Full Bill Text
                </h2>
                {bill.sourceUrl && (
                  <Button variant="outline" size="sm" asChild data-testid="button-view-official">
                    <a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Official Document
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed font-serif" data-testid="text-full-text">
                {bill.fullText}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <DataTransparency 
            sources={[
              ...defaultDataSources,
              { name: "Montgomery County Council", url: "https://www.montgomerycountymd.gov/council/" }
            ]}
            lastUpdated="2 hours ago"
          />
        </div>

        <Separator className="my-8" />

        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
          onUpvote={handleUpvote}
          isLoggedIn={isLoggedIn}
        />
        
        {!isLoggedIn && (
          <div className="mt-6">
            <SignInPrompt onSignIn={navigateToSignUp} context="comment" />
          </div>
        )}
      </div>
    </div>
  );
}
