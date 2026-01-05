import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  FileText, 
  Users, 
  ArrowRight, 
  Search, 
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  ExternalLink,
  Zap,
  Home,
  Car,
  Building2,
  Landmark,
  CheckCircle2
} from "lucide-react";
import { NeighborhoodGridLogo } from "@/components/NeighborhoodGridLogo";

interface RealBill {
  billNumber: string;
  title: string;
  status: string;
  sponsors: string[];
  coSponsors: string[];
  introductionDate: string | null;
  yesVotes: string[];
  noVotes: string[];
  finalVote: string | null;
  enactedBillUrl: string | null;
  sourceUrl: string;
  isLiveData: boolean;
}

interface PlatformStats {
  totalBills: number;
  councilMembers: number;
  neighborhoodsActive: number;
  totalVotes: number;
  neighborsEngaged: number;
}

const quickSearchTopics = [
  { label: "Housing", icon: Home },
  { label: "Transportation", icon: Car },
  { label: "Zoning", icon: Building2 },
  { label: "Budget", icon: Landmark },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'enacted': return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'approved': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'in_committee': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'introduced': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    default: return 'bg-muted text-muted-foreground';
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'enacted': return 'Enacted';
    case 'approved': return 'Approved';
    case 'in_committee': return 'In Committee';
    case 'introduced': return 'Introduced';
    default: return status;
  }
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [zipcode, setZipcode] = useState("");
  const [zipcodeError, setZipcodeError] = useState("");

  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ["/api/stats"],
  });

  // Try LegiScan API first, fallback to Montgomery County data
  const { data: legiScanBills = [], isLoading: legiScanLoading } = useQuery<any[]>({
    queryKey: ["/api/legiscan/bills"],
    retry: 1,
  });

  const { data: realBills = [], isLoading: billsLoading } = useQuery<RealBill[]>({
    queryKey: ["/api/real-bills"],
    enabled: legiScanBills.length === 0 && !legiScanLoading,
  });

  const handleZipcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipcode.match(/^\d{5}$/)) {
      setZipcodeError("Please enter a valid 5-digit ZIP code");
      return;
    }
    
    try {
      const response = await fetch(`/api/zipcodes/lookup/${zipcode}`);
      const data = await response.json();
      
      // Always navigate to dashboard - we support all Maryland zip codes
      setLocation("/dashboard");
    } catch {
      setZipcodeError("Error checking ZIP code. Please try again.");
    }
  };

  // Use LegiScan bills if available, otherwise use Montgomery County bills
  const allBills = legiScanBills.length > 0
    ? legiScanBills.map(bill => ({
        billNumber: bill.billNumber,
        title: bill.title,
        status: bill.status,
        sponsors: bill.sponsors?.map((s: any) => s.name) || [],
        coSponsors: [],
        introductionDate: bill.statusDate,
        yesVotes: [],
        noVotes: [],
        finalVote: null,
        enactedBillUrl: bill.url,
        sourceUrl: bill.url,
        isLiveData: true,
      }))
    : realBills;

  const displayedBills = allBills.slice(0, 5);
  const hasLiveData = legiScanBills.length > 0 || displayedBills.some(bill => bill.isLiveData);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Address Search */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <NeighborhoodGridLogo size={56} />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">About Town</h1>
          </div>
          
          <p className="text-xl text-primary font-medium mb-4">
            Track Maryland state legislation that impacts your community
          </p>
          <p className="text-2xl md:text-3xl text-foreground mb-4 font-medium">
            What's happening in Annapolis?
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Real-time access to Maryland House and Senate bills.
            Plain language summaries. No jargon. No paywall.
          </p>

          {/* Address/ZIP Search */}
          <form onSubmit={handleZipcodeSubmit} className="max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your Maryland ZIP code"
                  value={zipcode}
                  onChange={(e) => {
                    setZipcode(e.target.value);
                    setZipcodeError("");
                  }}
                  className="pl-10 h-14 text-lg"
                  data-testid="input-zipcode-search"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-6" data-testid="button-find-bills">
                <Search className="h-5 w-5 mr-2" />
                Find Bills
              </Button>
            </div>
            {zipcodeError && (
              <p className="text-sm text-destructive mt-2 text-left">{zipcodeError}</p>
            )}
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <span className="text-sm text-muted-foreground">Quick topics:</span>
            {quickSearchTopics.map((topic) => (
              <Link key={topic.label} href={`/dashboard?topic=${topic.label.toLowerCase()}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <topic.icon className="h-4 w-4" />
                  {topic.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Social Proof */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-center">
              <div data-testid="stat-neighbors">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stats.neighborsEngaged.toLocaleString()}+
                </p>
                <p className="text-sm text-muted-foreground">neighbors engaged</p>
              </div>
              <div data-testid="stat-bills">
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {stats.totalBills}
                </p>
                <p className="text-sm text-muted-foreground">active bills tracked</p>
              </div>
              <div data-testid="stat-neighborhoods">
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {stats.neighborhoodsActive}
                </p>
                <p className="text-sm text-muted-foreground">neighborhoods covered</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Live Bills Feed */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {hasLiveData ? (
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 gap-1">
                  <Zap className="h-3 w-3" />
                  Live Data
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  Sample Data
                </Badge>
              )}
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Recent Legislation
              </h2>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" data-testid="button-view-all-bills">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {billsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBills.map((bill) => {
                const totalVotes = bill.yesVotes.length + bill.noVotes.length;
                const supportPercent = totalVotes > 0 
                  ? Math.round((bill.yesVotes.length / totalVotes) * 100) 
                  : 50;

                return (
                  <Card 
                    key={bill.billNumber} 
                    className="hover-elevate"
                    data-testid={`card-bill-${bill.billNumber}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs font-mono">
                              {bill.billNumber}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(bill.status)}`}>
                              {formatStatus(bill.status)}
                            </Badge>
                            {bill.isLiveData ? (
                              <Badge variant="outline" className="text-xs gap-1 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Official
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                                Sample
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-medium text-foreground mb-2 leading-snug">
                            {bill.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Sponsored by {bill.sponsors.join(", ")}
                            {bill.introductionDate && ` | Introduced ${new Date(bill.introductionDate).toLocaleDateString()}`}
                          </p>

                          {/* Council Vote Breakdown */}
                          {totalVotes > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">Council Vote:</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3 text-green-600" />
                                  {bill.yesVotes.length} Yes
                                </span>
                                <span>{bill.finalVote || `${totalVotes} total votes`}</span>
                                <span className="flex items-center gap-1">
                                  {bill.noVotes.length} No
                                  <ThumbsDown className="h-3 w-3 text-red-500" />
                                </span>
                              </div>
                              <Progress value={supportPercent} className="h-2" />
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              data-testid={`button-support-${bill.billNumber}`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              data-testid={`button-oppose-${bill.billNumber}`}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="gap-1">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {bill.enactedBillUrl && (
                        <a 
                          href={bill.enactedBillUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Official Document
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground mb-4 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {legiScanBills.length > 0 ? (
                <>
                  Data sourced from Maryland State Legislature via LegiScan
                  <a
                    href="https://legiscan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : (
                <>
                  Data sourced from Montgomery County Open Data Portal
                  <a
                    href="https://data.montgomerycountymd.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-10">
            Civic Engagement Made Simple
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Enter Your ZIP
              </h3>
              <p className="text-muted-foreground">
                Access Maryland state bills that affect your community.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Understand the Impact
              </h3>
              <p className="text-muted-foreground">
                Plain-language summaries explain how each bill affects you.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Make Your Voice Heard
              </h3>
              <p className="text-muted-foreground">
                Vote, comment, and connect with neighbors on shared issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Democracy works better when you're informed
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join {stats?.neighborsEngaged.toLocaleString() || "thousands of"} neighbors already tracking local legislation.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8" data-testid="button-get-started">
              <TrendingUp className="h-5 w-5 mr-2" />
              Explore All Bills
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NeighborhoodGridLogo size={24} />
            <span className="font-medium text-foreground">About Town</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            By the People, For the People
          </p>
          <Link href="/about">
            <Button variant="ghost" size="sm" data-testid="link-footer-about">
              About & Data Sources
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
