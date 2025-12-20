import { Check, Clock, Vote, FileText, Gavel } from "lucide-react";

type BillStage = "proposed" | "introduced" | "committee" | "in_committee" | "vote" | "passed" | "failed" | "enacted" | "vetoed";

interface BillStatusProgressProps {
  currentStage: BillStage;
}

const stages = [
  { id: "proposed", label: "Proposed", icon: FileText },
  { id: "committee", label: "In Committee", icon: Clock },
  { id: "vote", label: "Council Vote", icon: Vote },
  { id: "passed", label: "Passed/Failed", icon: Gavel },
];

function getStageIndex(stage: BillStage): number {
  if (stage === "proposed" || stage === "introduced") return 0;
  if (stage === "committee" || stage === "in_committee") return 1;
  if (stage === "vote") return 2;
  return 3;
}

function isFinalStage(stage: BillStage): boolean {
  return ["passed", "failed", "enacted", "vetoed"].includes(stage);
}

function getFinalStageInfo(stage: BillStage): { label: string; isPositive: boolean } {
  switch (stage) {
    case "passed":
    case "enacted":
      return { label: stage === "enacted" ? "Enacted" : "Passed", isPositive: true };
    case "failed":
    case "vetoed":
      return { label: stage === "vetoed" ? "Vetoed" : "Failed", isPositive: false };
    default:
      return { label: "Pending", isPositive: true };
  }
}

export function BillStatusProgress({ currentStage }: BillStatusProgressProps) {
  const currentIndex = getStageIndex(currentStage);
  const finalInfo = getFinalStageInfo(currentStage);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted -z-10" />
        <div 
          className="absolute top-4 left-0 h-1 bg-primary -z-10 transition-all"
          style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
        />
        
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          const Icon = stage.icon;
          
          let finalLabel = stage.label;
          let isNegative = false;
          
          if (index === 3 && isFinalStage(currentStage)) {
            finalLabel = finalInfo.label;
            isNegative = !finalInfo.isPositive;
          }
          
          return (
            <div 
              key={stage.id} 
              className="flex flex-col items-center"
              data-testid={`stage-${stage.id}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                ${isCurrent && !isNegative ? "bg-accent text-accent-foreground ring-4 ring-accent/20" : ""}
                ${isCurrent && isNegative ? "bg-destructive text-destructive-foreground ring-4 ring-destructive/20" : ""}
                ${isPending ? "bg-muted text-muted-foreground" : ""}
              `}>
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className={`
                text-xs mt-2 font-medium text-center
                ${isCurrent ? "text-foreground" : "text-muted-foreground"}
              `}>
                {finalLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
