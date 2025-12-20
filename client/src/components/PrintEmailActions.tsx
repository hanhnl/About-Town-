import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Printer, 
  Mail, 
  Download,
  Check,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PrintEmailActionsProps {
  billTitle: string;
  billNumber: string;
}

export function PrintEmailActions({ billTitle, billNumber }: PrintEmailActionsProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Generating PDF",
      description: "Your download will begin shortly.",
    });
    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: `${billNumber} summary has been downloaded.`,
      });
    }, 1500);
  };

  const handleEmailSummary = () => {
    if (!email) return;
    setIsSending(true);
    
    setTimeout(() => {
      setIsSending(false);
      setDialogOpen(false);
      toast({
        title: "Summary sent!",
        description: (
          <div className="flex items-center justify-between">
            <span>Email sent to {email}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => {
                toast({
                  title: "Email cancelled",
                  description: "The email has been cancelled.",
                });
              }}
            >
              Undo
            </Button>
          </div>
        ),
      });
      setEmail("");
    }, 1500);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint}
        data-testid="button-print"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownloadPDF}
        data-testid="button-download-pdf"
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-email-summary">
            <Mail className="h-4 w-4 mr-2" />
            Email Summary
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Bill Summary</DialogTitle>
            <DialogDescription>
              We'll send a plain-language summary of {billNumber} to your email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-email-summary"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEmailSummary}
              disabled={!email || isSending}
              data-testid="button-send-summary"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Send Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
