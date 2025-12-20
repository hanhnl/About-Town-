import { BillCard, type Bill } from "../BillCard";

// todo: remove mock functionality
const mockBill: Bill = {
  id: "30001",
  billNumber: "ZTA-25-12",
  title: "University Boulevard Corridor Plan",
  summary: "This plan rezones a 3.5-mile stretch of University Boulevard in Silver Spring to allow more housing types. Single-family homeowners can now convert their homes to duplexes or triplexes.",
  status: "passed",
  topic: "zoning",
  voteDate: "Dec 8, 2025",
  commentCount: 12,
  supportVotes: 45,
  opposeVotes: 8,
};

export default function BillCardExample() {
  return (
    <div className="max-w-xl">
      <BillCard bill={mockBill} />
    </div>
  );
}
