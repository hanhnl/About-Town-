import { TopicBadge } from "../TopicBadge";

export default function TopicBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <TopicBadge topic="housing" />
      <TopicBadge topic="transportation" />
      <TopicBadge topic="education" />
      <TopicBadge topic="public_safety" />
      <TopicBadge topic="environment" />
      <TopicBadge topic="zoning" />
      <TopicBadge topic="healthcare" />
      <TopicBadge topic="budget" />
      <TopicBadge topic="community" />
    </div>
  );
}
