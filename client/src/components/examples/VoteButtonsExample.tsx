import { VoteButtons } from "../VoteButtons";

export default function VoteButtonsExample() {
  return (
    <div className="max-w-md space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Interactive voting:</p>
        <VoteButtons
          supportCount={45}
          opposeCount={12}
          onVote={(vote) => console.log(`Voted: ${vote}`)}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">With existing vote:</p>
        <VoteButtons
          supportCount={45}
          opposeCount={12}
          userVote="support"
          onVote={(vote) => console.log(`Voted: ${vote}`)}
        />
      </div>
    </div>
  );
}
