import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/StatsCard";
import { FilterBar } from "@/components/FilterBar";
import { BillCard, type Bill as BillCardType } from "@/components/BillCard";
import type { BillStatus } from "@/components/StatusBadge";
import type { Topic } from "@/components/TopicBadge";
import type { Bill } from "@shared/schema";
import { Loader2 } from "lucide-react";

function mapBillToCardFormat(bill: Bill): BillCardType {
  const statusMap: Record<string, BillStatus> = {
    "introduced": "introduced",
    "in_committee": "in_committee",
    "public_hearing": "active",
    "approved": "passed",
    "enacted": "enacted",
  };

  return {
    id: String(bill.id),
    billNumber: bill.billNumber,
    title: bill.title,
    summary: bill.summary || "",
    status: statusMap[bill.status] || "active",
    topic: bill.topic as Topic,
    voteDate: bill.voteDate || undefined,
    commentCount: 0,
    supportVotes: bill.supportVotes || 0,
    opposeVotes: bill.opposeVotes || 0,
    sourceUrl: bill.sourceUrl || undefined,
  };
}

export default function Dashboard() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const initialTopic = (searchParams.get("topic") as Topic) || "all";

  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [topicFilter, setTopicFilter] = useState<Topic | "all">(initialTopic);
  const [searchQuery, setSearchQuery] = useState("");

  // Try LegiScan API first, fallback to database bills
  const { data: legiScanBills = [], isLoading: legiScanLoading } = useQuery<any[]>({
    queryKey: ["/api/legiscan/bills"],
    retry: 1,
  });

  const { data: dbBills = [], isLoading: dbLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
    enabled: legiScanBills.length === 0 && !legiScanLoading,
  });

  // Convert LegiScan bills to our Bill format
  const bills = useMemo(() => {
    if (legiScanBills.length > 0) {
      return legiScanBills.map((bill: any) => ({
        id: bill.billId,
        billNumber: bill.billNumber,
        title: bill.title,
        summary: bill.description,
        status: bill.status,
        topic: 'community' as Topic, // Default topic, could be enhanced with AI categorization
        voteDate: bill.statusDate,
        supportVotes: 0,
        opposeVotes: 0,
        sourceUrl: bill.url,
        sponsors: bill.sponsors || [],
      }));
    }
    return dbBills;
  }, [legiScanBills, dbBills]);

  const isLoading = legiScanLoading || dbLoading;

  const filteredBills = useMemo(() => {
    return bills
      .map(mapBillToCardFormat)
      .filter((bill) => {
        if (statusFilter !== "all" && bill.status !== statusFilter) return false;
        if (topicFilter !== "all" && bill.topic !== topicFilter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            bill.title.toLowerCase().includes(query) ||
            bill.summary.toLowerCase().includes(query) ||
            bill.billNumber.toLowerCase().includes(query)
          );
        }
        return true;
      });
  }, [bills, statusFilter, topicFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = bills.length;
    const active = bills.filter((b) => ["active", "in_committee", "introduced", "public_hearing"].includes(b.status)).length;
    const passed = bills.filter((b) => ["approved", "enacted", "passed"].includes(b.status)).length;
    return { total, active, passed };
  }, [bills]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading legislation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Maryland State Legislation
          </h1>
          <p className="text-lg text-muted-foreground">
            {legiScanBills.length > 0
              ? `Tracking ${bills.length} bills from the Maryland General Assembly`
              : "Bills affecting your community in Maryland"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard label="Total Bills" value={stats.total} type="total" />
          <StatsCard label="Active" value={stats.active} type="active" />
          <StatsCard label="Passed" value={stats.passed} type="passed" />
        </div>

        <div className="mb-8">
          <FilterBar
            statusFilter={statusFilter}
            topicFilter={topicFilter}
            searchQuery={searchQuery}
            onStatusChange={setStatusFilter}
            onTopicChange={setTopicFilter}
            onSearchChange={setSearchQuery}
          />
        </div>

        {filteredBills.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <p className="text-lg text-muted-foreground">
              No bills match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBills.map((bill, index) => (
              <div
                key={bill.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <BillCard bill={bill} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredBills.length} of {bills.length} bills
        </div>
      </div>
    </div>
  );
}
