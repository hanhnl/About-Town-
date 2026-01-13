import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Twitter, Facebook, Linkedin, Mail, Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  billNumber: string;
  url?: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({
  title,
  billNumber,
  url,
  description,
  variant = "outline",
  size = "default"
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Generate share URL - use current page if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${billNumber}: ${title}`;
  const shareDescription = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareDescription + '\n\n' + shareUrl)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  // Use native share API if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - ignore
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          {size !== "icon" && "Share"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share via...
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-green-600">Link copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy link
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="h-4 w-4 mr-2" />
          Share via email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
