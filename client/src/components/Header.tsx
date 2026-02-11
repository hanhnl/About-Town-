import { useState } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { Menu, X, User, MapPin, Check, AlertCircle, UserPlus, LogOut, Star, Crosshair, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { NeighborhoodGridLogo } from "./NeighborhoodGridLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserLocation } from "@/contexts/LocationContext";

// All US states for the selector
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington DC' },
];
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useWouterLocation();
  const { location: userLocation, setZipcode, setStateCode, detectLocation, isSupported, isLoading, isDetecting, hasJurisdiction, locationError } = useUserLocation();
  const [zipcodeInput, setZipcodeInput] = useState(userLocation.zipcode);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Bills" },
    { href: "/issues", label: "Issues" },
    { href: "/representatives", label: "Your Reps" },
    { href: "/about", label: "About" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleZipcodeSubmit = () => {
    if (zipcodeInput.length === 5 && /^\d{5}$/.test(zipcodeInput)) {
      setZipcode(zipcodeInput);
      setPopoverOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleZipcodeSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-6">
            <Link href="/" data-testid="link-home" className="flex items-center gap-2" aria-label="About Town - Home">
              <NeighborhoodGridLogo size={36} />
              <span className="text-xl font-semibold text-foreground">
                About Town
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* State Selector */}
            <Select
              value={userLocation.stateCode || 'MD'}
              onValueChange={(value) => setStateCode(value)}
            >
              <SelectTrigger className="hidden sm:flex w-auto gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 h-auto border-0" data-testid="select-state">
                <MapPin className="h-4 w-4" />
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {US_STATES.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.code} - {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Popover */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground bg-muted px-3 py-1.5 h-auto"
                  data-testid="button-zipcode"
                >
                  <Crosshair className="h-4 w-4" />
                  <span data-testid="text-zipcode">{userLocation.zipcode}</span>
                  {userLocation.city && (
                    <span className="text-xs opacity-70">({userLocation.city})</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Your Location</h4>
                    <p className="text-xs text-muted-foreground">
                      Enter your ZIP code to see legislation that affects your area
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                    onClick={detectLocation}
                    disabled={isDetecting}
                    data-testid="button-detect-location"
                  >
                    {isDetecting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Crosshair className="h-4 w-4 mr-2" />
                    )}
                    {isDetecting ? "Detecting..." : "Use My Location"}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-popover px-2 text-muted-foreground">or enter ZIP</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter ZIP code"
                      value={zipcodeInput}
                      onChange={(e) => setZipcodeInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                      data-testid="input-zipcode-change"
                    />
                    <Button
                      size="icon"
                      onClick={handleZipcodeSubmit}
                      disabled={zipcodeInput.length !== 5}
                      data-testid="button-zipcode-submit"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  {locationError && (
                    <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{locationError}</span>
                    </div>
                  )}
                  {isSupported && !hasJurisdiction && !isLoading && (
                    <div className="flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        Browsing all available legislation. For location-specific filtering, try a Montgomery County ZIP (e.g., 20902).
                      </span>
                    </div>
                  )}
                  {(userLocation.state || userLocation.jurisdiction) && (
                    <div className="text-xs text-muted-foreground pt-1 border-t">
                      {userLocation.state && (
                        <span className="font-medium">{userLocation.state}</span>
                      )}
                      {userLocation.jurisdiction && (
                        <span className="font-medium">{userLocation.jurisdiction.name}</span>
                      )}
                      {userLocation.city && (
                        <span> - {userLocation.city}</span>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <ThemeToggle />

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="font-medium flex flex-col items-start">
                    <span>{user.firstName} {user.lastName?.charAt(0)}.</span>
                    <span className="text-xs text-muted-foreground">{user.neighborhood || user.zipcode}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem data-testid="link-my-profile">
                      <Star className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={logout} data-testid="button-sign-out">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signup">
                <Button data-testid="button-sign-up">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border" aria-label="Mobile navigation">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              {/* Mobile State Selector */}
              <Select
                value={userLocation.stateCode || 'MD'}
                onValueChange={(value) => setStateCode(value)}
              >
                <SelectTrigger className="w-full justify-start gap-2 bg-primary text-primary-foreground" data-testid="select-state-mobile">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {US_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.code} - {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPopoverOpen(true);
                }}
                data-testid="button-mobile-zipcode"
              >
                <Crosshair className="h-4 w-4" />
                <span>{userLocation.zipcode}</span>
                {userLocation.city && (
                  <span className="text-xs opacity-70">({userLocation.city})</span>
                )}
              </Button>
              {!isLoggedIn && (
                <Link href="/signup">
                  <Button
                    className="w-full justify-start mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-mobile-sign-up"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
