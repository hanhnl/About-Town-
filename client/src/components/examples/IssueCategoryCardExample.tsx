import { IssueCategoryCard } from "../IssueCategoryCard";

export default function IssueCategoryCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <IssueCategoryCard
        topic="housing"
        billCount={6}
        description="Rent control, affordable housing, tenant rights, and residential development policies."
      />
      <IssueCategoryCard
        topic="transportation"
        billCount={2}
        description="Public transit, bike lanes, road improvements, and traffic safety measures."
      />
    </div>
  );
}
