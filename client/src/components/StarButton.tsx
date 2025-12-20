import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface StarButtonProps {
  billId: number;
  variant?: "icon" | "default";
  size?: "sm" | "default" | "icon";
  className?: string;
}

export function StarButton({ billId, variant = "icon", size = "icon", className }: StarButtonProps) {
  const { isLoggedIn, user } = useAuth();

  const { data: isStarred = false } = useQuery<boolean>({
    queryKey: ["/api/bills", billId, "starred", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const res = await fetch(`/api/bills/${billId}/starred?userId=${user.id}`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.starred;
    },
    enabled: isLoggedIn && !!user?.id,
  });

  const starMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not logged in");
      if (isStarred) {
        await apiRequest("DELETE", `/api/bills/${billId}/star`, { userId: user.id });
      } else {
        await apiRequest("POST", `/api/bills/${billId}/star`, { userId: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills", billId, "starred", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "starred-bills"] });
    },
  });

  if (!isLoggedIn) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    starMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={starMutation.isPending}
      className={cn(
        "transition-colors",
        isStarred ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground",
        className
      )}
      data-testid={`button-star-bill-${billId}`}
      title={isStarred ? "Remove from saved" : "Save bill"}
    >
      <Star className={cn("h-5 w-5", isStarred && "fill-current")} />
      {variant === "default" && (
        <span className="ml-2">{isStarred ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}
