import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Eye, DollarSign, Heart, Shield, Accessibility, Database, Sparkles, FileText, ExternalLink } from "lucide-react";
import { NeighborhoodGridLogo } from "@/components/NeighborhoodGridLogo";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <NeighborhoodGridLogo size={80} className="mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4 leading-tight">
            By the People, For the People
          </h1>
          <p className="text-2xl text-accent font-medium mb-8">
            Civic engagement made simple.
          </p>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            About Town exists because we believe every citizen deserves to understand 
            the laws that shape their community - without paywalls, jargon, or complexity.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
            Why We Built This
          </h2>
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-lg leading-relaxed mb-6">
              Most local government websites are confusing, paywalled, or built for lobbyists.
              <strong> About Town is different.</strong> Plain-language summaries, council voting records, 
              neighbor discussions - all free.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-7 w-7 text-accent" />
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              How It Works
            </h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Public Data Collection</h3>
                <p className="text-base text-muted-foreground">
                  We gather publicly available information from official government sources - council meeting 
                  records, proposed legislation, voting records, and campaign finance filings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">AI-Powered Summaries</h3>
                <p className="text-base text-muted-foreground">
                  Artificial intelligence helps us translate complex legal language into plain English summaries. 
                  AI also personalizes impact analysis based on your location and circumstances.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Localized for You</h3>
                <p className="text-base text-muted-foreground">
                  Enter your zipcode and we show you legislation that affects your specific neighborhood - 
                  from zoning changes on your block to tax policies that impact your wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ExternalLink className="h-7 w-7 text-accent" />
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Our Data Sources
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            All information comes from official public records:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href="https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover-elevate">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    MoCo Open Data Portal
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">Council bills, resolutions, amendments database</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://www.montgomerycountymd.gov/council/" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover-elevate">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    Montgomery County Council
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">Meeting agendas, voting records, council members</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://montgomeryplanning.org/" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover-elevate">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    Montgomery Planning
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">Zoning text amendments, master plans, land use</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://www.montgomerycountymd.gov/COUNCIL/leg/zta/index.html" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover-elevate">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    Zoning Text Amendments
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">Official ZTA records and status tracking</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://www.mcccmd.com/countyarchives.html" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover-elevate">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    MoCo Civic Collective
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">County archives and historical records</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://mgaleg.maryland.gov/" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover-elevate">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    Maryland General Assembly
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">State legislation affecting the county</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            Our Principles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card data-testid="card-principle-free">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Always Free</h3>
                    <p className="text-base text-muted-foreground">No paywalls. Ever.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-principle-plain">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Plain Language</h3>
                    <p className="text-base text-muted-foreground">No jargon. Simple explanations.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-principle-accessible">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Accessibility className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Accessible Design</h3>
                    <p className="text-base text-muted-foreground">Large text, clear navigation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-principle-community">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Community First</h3>
                    <p className="text-base text-muted-foreground">Hear what your neighbors think.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-principle-facts">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Facts Only</h3>
                    <p className="text-base text-muted-foreground">Data, not opinions. You decide.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-principle-local">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Hyperlocal</h3>
                    <p className="text-base text-muted-foreground">Issues that affect your daily life.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
            Who This Is For
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-lg text-foreground">
            <p className="flex items-center gap-3">
              <span className="text-accent text-xl">&#10003;</span>
              <span><strong>Parents</strong> tracking school funding</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-accent text-xl">&#10003;</span>
              <span><strong>Homeowners</strong> watching zoning changes</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-accent text-xl">&#10003;</span>
              <span><strong>Renters</strong> following tenant rights</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-accent text-xl">&#10003;</span>
              <span><strong>Business owners</strong> monitoring regulations</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-accent text-xl">&#10003;</span>
              <span><strong>Retirees</strong> staying informed easily</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-accent text-xl">&#10003;</span>
              <span><strong>Anyone</strong> who values informed democracy</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse legislation in your area - no account required.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8" data-testid="button-explore-bills">
              Explore Local Bills
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
