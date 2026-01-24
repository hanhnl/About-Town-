import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUserLocation } from "@/contexts/LocationContext";
import { StatsCard } from "@/components/StatsCard";
import { FilterBar } from "@/components/FilterBar";
import { BillCard, type Bill as BillCardType } from "@/components/BillCard";
import type { BillStatus } from "@/components/StatusBadge";
import type { Topic } from "@/components/TopicBadge";
import type { Bill } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, FileText, MapPin } from "lucide-react";

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

  // Get user's location from context
  const { location: userLocation, hasJurisdiction } = useUserLocation();

  // Conditionally fetch local bills (Montgomery County) or state bills
  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: hasJurisdiction
      ? ["/api/real-bills", userLocation.jurisdiction?.id]
      : ["/api/bills"],
    retry: 2,
  });

  // Debug: Log what we received from API
  console.log('[Dashboard] API response - bills:', bills);
  console.log('[Dashboard] Bills count:', (bills || []).length);
  console.log('[Dashboard] Bills type:', typeof bills, Array.isArray(bills));

  const filteredBills = useMemo(() => {
    const mappedBills = (bills || []).map(mapBillToCardFormat);
    console.log('[Dashboard] After mapping:', mappedBills.length, 'bills');

    const filtered = mappedBills.filter((bill) => {
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

    console.log('[Dashboard] After filtering:', filtered.length, 'bills');
    console.log('[Dashboard] Filters - status:', statusFilter, 'topic:', topicFilter, 'search:', searchQuery);
    return filtered;
  }, [bills, statusFilter, topicFilter, searchQuery]);

  const stats = useMemo(() => {
    const safeBills = bills || [];
    const total = safeBills.length;
    const active = safeBills.filter((b) => ["active", "in_committee", "introduced", "public_hearing"].includes(b.status)).length;
    const passed = safeBills.filter((b) => ["approved", "enacted", "passed"].includes(b.status)).length;
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

  const hasLiveData = (bills || []).some((bill: any) => bill.isLiveData);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
              {hasJurisdiction && userLocation.jurisdiction?.name
                ? `${userLocation.jurisdiction.name} Legislation`
                : "Maryland State Legislation"
              }
            </h1>
            {hasLiveData ? (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 gap-1">
                <Zap className="h-3 w-3" />
                Live Data
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <FileText className="h-3 w-3" />
                Sample Data
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            {userLocation.city && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {userLocation.city}, MD ({userLocation.zipcode})
              </Badge>
            )}
            {hasJurisdiction && (
              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                📍 Local Bills
              </Badge>
            )}
            {!hasJurisdiction && (
              <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                🏛️ State Bills
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">
            {(bills || []).length > 0
              ? hasJurisdiction
                ? `Tracking ${(bills || []).length} local bills from ${userLocation.jurisdiction?.name || "your area"}`
                : `Tracking ${(bills || []).length} bills from the Maryland General Assembly`
              : "Loading bills..."
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
          Showing {filteredBills.length} of {(bills || []).length} bills
        </div>
      </div>
    </div>
  );
}
