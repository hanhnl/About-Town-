import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Mail, User, MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import { NeighborhoodGridLogo } from "@/components/NeighborhoodGridLogo";
import { useAuth } from "@/contexts/AuthContext";

const registrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  zipcode: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d{5}$/, "ZIP code must be 5 digits"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ firstName: string; neighborhood: string | null } | null>(null);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      zipcode: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      login({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: null,
        neighborhood: data.user.neighborhood,
        zipcode: data.user.zipcode,
        isModerator: false,
      });
      setSuccessData({
        firstName: data.user.firstName,
        neighborhood: data.user.neighborhood,
      });
      setIsSuccess(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    registerMutation.mutate(data);
  };

  if (isSuccess && successData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-welcome-title">Welcome to About Town!</CardTitle>
            <CardDescription className="text-base">
              {successData.firstName}, you're now part of the{" "}
              {successData.neighborhood ? `${successData.neighborhood} ` : ""}
              civic community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Stay informed about local legislation that affects your neighborhood.
              Browse bills, see how your representatives vote, and make your voice heard.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setLocation("/dashboard")} data-testid="button-browse-bills">
                Browse Local Bills
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-go-home">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <NeighborhoodGridLogo size={48} />
          </Link>
          <CardTitle className="text-2xl flex items-center justify-center gap-2" data-testid="text-signup-title">
            <UserPlus className="h-6 w-6" />
            Join About Town
          </CardTitle>
          <CardDescription className="text-base">
            Stay informed about local legislation in your neighborhood.
            It's free and takes less than a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Jane"
                            className="pl-9"
                            data-testid="input-first-name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Smith"
                          data-testid="input-last-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          className="pl-9"
                          data-testid="input-email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="20902"
                          maxLength={5}
                          className="pl-9"
                          data-testid="input-zipcode"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      We currently support Montgomery County, MD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-submit-signup"
              >
                {registerMutation.isPending ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>By signing up, you'll receive updates about bills affecting your neighborhood.</p>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link href="/">
              <Button variant="ghost" className="w-full" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
