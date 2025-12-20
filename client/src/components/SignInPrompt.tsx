import { LogIn, MessageSquare, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SignInPromptProps {
  onSignIn: () => void;
  context?: "vote" | "comment";
}

export function SignInPrompt({ onSignIn, context = "comment" }: SignInPromptProps) {
  const Icon = context === "vote" ? ThumbsUp : MessageSquare;
  const message = context === "vote" 
    ? "Sign in to vote on this bill and let your voice be heard."
    : "Sign in to join the community discussion about this bill.";

  return (
    <Card className="bg-muted/50 border-dashed" data-testid="card-sign-in-prompt">
      <CardContent className="p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">
          Join the Conversation
        </h3>
        <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
          {message}
        </p>
        <Button size="lg" onClick={onSignIn} data-testid="button-sign-in-prompt">
          <LogIn className="h-4 w-4 mr-2" />
          Sign In to Participate
        </Button>
      </CardContent>
    </Card>
  );
}
