import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Link as LinkIcon, 
  Mail,
  MessageCircle,
  Check
} from "lucide-react";
import { SiFacebook, SiX, SiWhatsapp, SiNextdoor } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialShareProps {
  title: string;
  url?: string;
  summary?: string;
}

export function SocialShare({ title, url, summary }: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary || "");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: (
        <span>
          Share this bill with your neighbors.{" "}
          <button 
            className="underline text-primary" 
            onClick={() => {
              navigator.clipboard.writeText("");
              toast({ title: "Clipboard cleared" });
            }}
          >
            Undo
          </button>
        </span>
      ),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: summary,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-share">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={handleCopyLink} data-testid="share-copy-link">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <LinkIcon className="h-4 w-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-facebook"
          >
            <SiFacebook className="h-4 w-4 mr-2" />
            Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-x"
          >
            <SiX className="h-4 w-4 mr-2" />
            X (Twitter)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-whatsapp"
          >
            <SiWhatsapp className="h-4 w-4 mr-2" />
            WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`https://nextdoor.com/share/?link=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-nextdoor"
          >
            <SiNextdoor className="h-4 w-4 mr-2" />
            Nextdoor
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`}
            data-testid="share-email"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`sms:?body=${encodedTitle}%20${encodedUrl}`}
            data-testid="share-sms"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Text Message
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
