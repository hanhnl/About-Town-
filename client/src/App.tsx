import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Issues from "@/pages/Issues";
import BillDetail from "@/pages/BillDetail";
import About from "@/pages/About";
import Representatives from "@/pages/Representatives";
import SignUp from "@/pages/SignUp";
import MyProfile from "@/pages/MyProfile";

function Router() {
  return (
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
  );
}

function App() {
  return (
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
  );
}

export default App;
