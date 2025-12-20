import { StatsCard } from "../StatsCard";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <StatsCard label="Total Bills" value={9} type="total" />
      <StatsCard label="Active" value={2} type="active" />
      <StatsCard label="Passed" value={7} type="passed" />
      <StatsCard label="Your Votes" value={0} type="votes" />
    </div>
  );
}
