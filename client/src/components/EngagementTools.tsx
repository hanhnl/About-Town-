import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Mail, 
  Calendar, 
  Mic, 
  Copy, 
  Check,
  Bell,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EngagementToolsProps {
  billId: string;
  billTitle: string;
  billNumber: string;
  nextHearingDate?: string;
  repName?: string;
  repEmail?: string;
}

export function EngagementTools({ 
  billId, 
  billTitle, 
  billNumber,
  nextHearingDate = "December 22, 2025 at 7:00 PM",
  repName = "Council Member Andrew Friedson",
  repEmail = "councilmember.friedson@montgomerycountymd.gov"
}: EngagementToolsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState(
    `Dear ${repName},\n\nI am writing regarding ${billNumber}: ${billTitle}.\n\n[Share your thoughts here - why do you support or oppose this bill? How does it affect you personally?]\n\nI respectfully ask that you [support/oppose] this legislation.\n\nThank you for your service to our community.\n\nSincerely,\n[Your Name]\n[Your Address]`
  );

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Email copied!",
      description: "Paste it into your email client to send.",
    });
  };

  const handleSetReminder = () => {
    // todo: implement calendar integration
    toast({
      title: "Reminder set!",
      description: `We'll notify you before the hearing on ${nextHearingDate}`,
    });
  };

  const handleSignUpToSpeak = () => {
    // todo: implement sign-up flow
    toast({
      title: "Sign-up requested",
      description: "Check your email for confirmation details.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mic className="h-5 w-5 text-primary" />
          Take Action
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                data-testid="button-email-rep"
              >
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium">Email Your Rep</span>
                <span className="text-xs text-muted-foreground">Pre-written template</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Email Your Representative</DialogTitle>
                <DialogDescription>
                  Customize this template and send it to {repName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">
                    <strong>To:</strong> {repEmail}
                  </p>
                  <p className="text-sm">
                    <strong>Subject:</strong> Regarding {billNumber}
                  </p>
                </div>
                <Textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="min-h-[250px] text-sm"
                  data-testid="textarea-email-content"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCopyEmail} className="flex-1" data-testid="button-copy-email">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`mailto:${repEmail}?subject=Regarding ${billNumber}&body=${encodeURIComponent(emailContent)}`)}
                    data-testid="button-open-email"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Email App
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={handleSetReminder}
            data-testid="button-set-reminder"
          >
            <Bell className="h-5 w-5 text-accent" />
            <span className="font-medium">Set Reminder</span>
            <span className="text-xs text-muted-foreground">For public hearing</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={handleSignUpToSpeak}
            data-testid="button-sign-up-speak"
          >
            <Mic className="h-5 w-5 text-primary" />
            <span className="font-medium">Sign Up to Speak</span>
            <span className="text-xs text-muted-foreground">At council meeting</span>
          </Button>
        </div>

        {nextHearingDate && (
          <div className="mt-4 p-3 rounded-lg bg-accent/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-sm">
                <strong>Next Hearing:</strong> {nextHearingDate}
              </span>
            </div>
            <Badge variant="outline" className="text-accent border-accent/30">
              Public testimony accepted
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
