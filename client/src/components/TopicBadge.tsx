import { Badge } from "@/components/ui/badge";
import { Home, Car, GraduationCap, Shield, Leaf, Building2, Heart, DollarSign, Users, FileText } from "lucide-react";

export type Topic = "housing" | "transportation" | "education" | "public_safety" | "public-safety" | "environment" | "zoning" | "healthcare" | "budget" | "community" | "consumer-protection" | string;

interface TopicBadgeProps {
  topic: Topic;
  showIcon?: boolean;
}

const topicConfig: Record<string, { label: string; icon: typeof Home }> = {
  housing: { label: "Housing", icon: Home },
  transportation: { label: "Transportation", icon: Car },
  education: { label: "Education", icon: GraduationCap },
  public_safety: { label: "Public Safety", icon: Shield },
  "public-safety": { label: "Public Safety", icon: Shield },
  environment: { label: "Environment", icon: Leaf },
  zoning: { label: "Zoning", icon: Building2 },
  healthcare: { label: "Healthcare", icon: Heart },
  budget: { label: "Budget", icon: DollarSign },
  community: { label: "Community", icon: Users },
  "consumer-protection": { label: "Consumer Protection", icon: Users },
};

const defaultConfig = { label: "General", icon: FileText };

export function TopicBadge({ topic, showIcon = true }: TopicBadgeProps) {
  const config = topicConfig[topic] || defaultConfig;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className="text-sm font-medium px-3 py-1 gap-1.5 bg-muted/50"
      data-testid={`badge-topic-${topic}`}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}

export function getTopicLabel(topic: Topic): string {
  return topicConfig[topic]?.label || topic;
}

export function getTopicIcon(topic: Topic) {
  return topicConfig[topic]?.icon || FileText;
}
