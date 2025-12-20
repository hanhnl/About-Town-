import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { BillStatus } from "./StatusBadge";
import type { Topic } from "./TopicBadge";

interface FilterBarProps {
  statusFilter: BillStatus | "all";
  topicFilter: Topic | "all";
  searchQuery: string;
  onStatusChange: (status: BillStatus | "all") => void;
  onTopicChange: (topic: Topic | "all") => void;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  statusFilter,
  topicFilter,
  searchQuery,
  onStatusChange,
  onTopicChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
          data-testid="input-search"
        />
      </div>

      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as BillStatus | "all")}>
        <SelectTrigger className="w-full sm:w-48 h-12" data-testid="select-status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="in_committee">In Committee</SelectItem>
          <SelectItem value="introduced">Introduced</SelectItem>
          <SelectItem value="passed">Passed</SelectItem>
          <SelectItem value="enacted">Enacted</SelectItem>
        </SelectContent>
      </Select>

      <Select value={topicFilter} onValueChange={(v) => onTopicChange(v as Topic | "all")}>
        <SelectTrigger className="w-full sm:w-48 h-12" data-testid="select-topic">
          <SelectValue placeholder="All Topics" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          <SelectItem value="housing">Housing</SelectItem>
          <SelectItem value="transportation">Transportation</SelectItem>
          <SelectItem value="education">Education</SelectItem>
          <SelectItem value="public_safety">Public Safety</SelectItem>
          <SelectItem value="environment">Environment</SelectItem>
          <SelectItem value="zoning">Zoning</SelectItem>
          <SelectItem value="healthcare">Healthcare</SelectItem>
          <SelectItem value="budget">Budget</SelectItem>
          <SelectItem value="community">Community</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
