import { IssueCategoryCard } from "@/components/IssueCategoryCard";
import type { Topic } from "@/components/TopicBadge";

// todo: remove mock functionality
const issueCategories: { topic: Topic; billCount: number; description: string }[] = [
  {
    topic: "housing",
    billCount: 6,
    description: "Rent control, affordable housing, tenant rights, and residential development policies affecting where and how people live.",
  },
  {
    topic: "zoning",
    billCount: 2,
    description: "Land use regulations, building codes, and neighborhood development plans that shape our community's growth.",
  },
  {
    topic: "transportation",
    billCount: 1,
    description: "Public transit improvements, bike lanes, road maintenance, and traffic safety measures for getting around.",
  },
  {
    topic: "education",
    billCount: 0,
    description: "School funding, curriculum policies, teacher support, and educational programs for all ages.",
  },
  {
    topic: "public_safety",
    billCount: 0,
    description: "Police reform, emergency services, crime prevention, and community safety initiatives.",
  },
  {
    topic: "environment",
    billCount: 0,
    description: "Climate action, clean energy, parks and green spaces, and environmental protection measures.",
  },
  {
    topic: "healthcare",
    billCount: 0,
    description: "Public health programs, healthcare access, mental health services, and community wellness.",
  },
  {
    topic: "budget",
    billCount: 0,
    description: "County and city budgets, tax policies, public spending priorities, and fiscal responsibility.",
  },
  {
    topic: "community",
    billCount: 0,
    description: "Local events, neighborhood programs, civic engagement, and community development initiatives.",
  },
];

export default function Issues() {
  const categoriesWithBills = issueCategories.filter((c) => c.billCount > 0);
  const categoriesWithoutBills = issueCategories.filter((c) => c.billCount === 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Browse by Issue
          </h1>
          <p className="text-lg text-muted-foreground">
            Find legislation organized by the topics that matter most to you
          </p>
        </div>

        {categoriesWithBills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-medium text-foreground mb-6">
              Active Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithBills.map((category) => (
                <IssueCategoryCard
                  key={category.topic}
                  topic={category.topic}
                  billCount={category.billCount}
                  description={category.description}
                />
              ))}
            </div>
          </div>
        )}

        {categoriesWithoutBills.length > 0 && (
          <div>
            <h2 className="text-xl font-medium text-foreground mb-6">
              Other Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithoutBills.map((category) => (
                <IssueCategoryCard
                  key={category.topic}
                  topic={category.topic}
                  billCount={category.billCount}
                  description={category.description}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
