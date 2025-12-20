import { useState } from "react";
import { FilterBar } from "../FilterBar";
import type { BillStatus } from "../StatusBadge";
import type { Topic } from "../TopicBadge";

export default function FilterBarExample() {
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [topicFilter, setTopicFilter] = useState<Topic | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <FilterBar
      statusFilter={statusFilter}
      topicFilter={topicFilter}
      searchQuery={searchQuery}
      onStatusChange={setStatusFilter}
      onTopicChange={setTopicFilter}
      onSearchChange={setSearchQuery}
    />
  );
}
