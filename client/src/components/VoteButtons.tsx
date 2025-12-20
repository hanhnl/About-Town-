import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteButtonsProps {
  supportCount: number;
  opposeCount: number;
  userVote?: "support" | "oppose" | null;
  onVote: (vote: "support" | "oppose") => void;
  disabled?: boolean;
}

export function VoteButtons({
  supportCount,
  opposeCount,
  userVote = null,
  onVote,
  disabled = false,
}: VoteButtonsProps) {
  const [localVote, setLocalVote] = useState(userVote);
  const [localSupport, setLocalSupport] = useState(supportCount);
  const [localOppose, setLocalOppose] = useState(opposeCount);

  const handleVote = (vote: "support" | "oppose") => {
    if (disabled) return;

    if (localVote === vote) {
      setLocalVote(null);
      if (vote === "support") setLocalSupport((prev) => prev - 1);
      else setLocalOppose((prev) => prev - 1);
    } else {
      if (localVote === "support") setLocalSupport((prev) => prev - 1);
      if (localVote === "oppose") setLocalOppose((prev) => prev - 1);
      
      setLocalVote(vote);
      if (vote === "support") setLocalSupport((prev) => prev + 1);
      else setLocalOppose((prev) => prev + 1);
    }
    onVote(vote);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        variant={localVote === "support" ? "default" : "outline"}
        size="lg"
        onClick={() => handleVote("support")}
        disabled={disabled}
        className={`flex-1 ${localVote === "support" ? "bg-chart-2 border-chart-2 text-white" : ""}`}
        data-testid="button-vote-support"
      >
        <ThumbsUp className="h-5 w-5 mr-2" />
        Support ({localSupport})
      </Button>
      <Button
        variant={localVote === "oppose" ? "default" : "outline"}
        size="lg"
        onClick={() => handleVote("oppose")}
        disabled={disabled}
        className={`flex-1 ${localVote === "oppose" ? "bg-destructive border-destructive text-white" : ""}`}
        data-testid="button-vote-oppose"
      >
        <ThumbsDown className="h-5 w-5 mr-2" />
        Oppose ({localOppose})
      </Button>
    </div>
  );
}
