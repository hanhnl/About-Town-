import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="passed" />
      <StatusBadge status="enacted" />
      <StatusBadge status="in_committee" />
      <StatusBadge status="introduced" />
      <StatusBadge status="active" />
    </div>
  );
}
