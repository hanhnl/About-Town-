import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Copy, Check } from "lucide-react";

interface ContactRepTemplateProps {
  billNumber: string;
  billTitle: string;
  repName?: string;
  repEmail?: string;
  userPosition?: "support" | "oppose";
}

export function ContactRepTemplate({
  billNumber,
  billTitle,
  repName = "your representative",
  repEmail = "",
  userPosition = "support"
}: ContactRepTemplateProps) {
  const [copied, setCopied] = useState(false);

  // Generate email template
  const emailSubject = `${userPosition === "support" ? "Support" : "Opposition"} for ${billNumber}: ${billTitle}`;

  const emailBody = `Dear ${repName},

I am writing to express my ${userPosition === "support" ? "strong support" : "opposition"} for ${billNumber} - ${billTitle}.

As a constituent in your district, I believe this bill ${userPosition === "support" ? "will have a positive impact" : "raises serious concerns"} on our community because:

[Please add your specific reasons here. Be specific about how this bill affects you, your family, or your community.]

${userPosition === "support"
    ? "I urge you to support this legislation and work toward its passage."
    : "I respectfully ask you to oppose this legislation or work toward amendments that address these concerns."}

Thank you for your time and consideration of my views. I look forward to your response on this matter.

Sincerely,
[Your Full Name]
[Your Address]
[Your Phone Number]
[Your Email]`;

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(emailBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${repEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Your Representative
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email-subject">Subject</Label>
          <div className="mt-2 p-3 bg-muted rounded-md text-sm">
            {emailSubject}
          </div>
        </div>

        <div>
          <Label htmlFor="email-body">Email Template</Label>
          <Textarea
            id="email-body"
            value={emailBody}
            readOnly
            className="mt-2 min-h-[300px] font-mono text-sm"
          />
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <strong>Tip:</strong> Personalize this template by adding specific details about how this bill affects you.
          Representatives are more responsive to personal stories and specific local impacts than generic form letters.
        </div>

        <div className="flex flex-wrap gap-2">
          {repEmail ? (
            <Button onClick={handleSendEmail} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Open in Email Client
            </Button>
          ) : (
            <Button disabled className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Representative Email Not Available
            </Button>
          )}

          <Button variant="outline" onClick={handleCopyTemplate}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Template
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">How to be effective:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be respectful and professional in your tone</li>
            <li>Include your full name and address to verify you're a constituent</li>
            <li>Be specific about your concerns or support</li>
            <li>Share personal stories when relevant</li>
            <li>Request a response and follow up if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
