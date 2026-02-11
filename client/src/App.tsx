import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance (code-splitting)
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Issues = lazy(() => import("@/pages/Issues"));
const BillDetail = lazy(() => import("@/pages/BillDetail"));
const About = lazy(() => import("@/pages/About"));
const Representatives = lazy(() => import("@/pages/Representatives"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const MyProfile = lazy(() => import("@/pages/MyProfile"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/issues" component={Issues} />
        <Route path="/representatives" component={Representatives} />
        <Route path="/about" component={About} />
        <Route path="/signup" component={SignUp} />
        <Route path="/profile" component={MyProfile} />
        <Route path="/my-profile" component={MyProfile} />
        <Route path="/bill/:id" component={BillDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LocationProvider>
            <AuthProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background">
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
                  >
                    Skip to main content
                  </a>
                  <Header />
                  <main id="main-content" role="main">
                    <Router />
                  </main>
                </div>
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </LocationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
