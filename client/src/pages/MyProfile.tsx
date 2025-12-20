import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, MapPin, Calendar, ArrowRight, FileText } from "lucide-react";
import type { Bill, Comment } from "@shared/schema";

interface StarredBillResponse {
  id: number;
  billId: number;
  createdAt: string;
  bill: Bill;
}

interface CommentWithBill extends Comment {
  bill?: Bill;
}

export default function MyProfile() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  const { data: starredBills, isLoading: starsLoading } = useQuery<StarredBillResponse[]>({
    queryKey: ["/api/users", user?.id, "starred-bills"],
    enabled: !!user?.id,
  });

  const { data: userComments, isLoading: commentsLoading } = useQuery<CommentWithBill[]>({
    queryKey: ["/api/users", user?.id, "comments"],
    enabled: !!user?.id,
  });

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Sign in to view your profile</CardTitle>
            <CardDescription>
              Create an account to star bills, comment on legislation, and track your civic engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/signup">
              <Button className="w-full" data-testid="button-signup-prompt">
                Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl" data-testid="text-profile-name">
                  {user.firstName} {user.lastName?.charAt(0)}.
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {user.neighborhood || user.zipcode}
                </CardDescription>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span data-testid="text-starred-count">{starredBills?.length || 0} starred</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span data-testid="text-comments-count">{userComments?.length || 0} comments</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="starred" className="space-y-4">
          <TabsList>
            <TabsTrigger value="starred" data-testid="tab-starred">
              <Star className="h-4 w-4 mr-2" />
              Starred Bills
            </TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              My Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="starred" className="space-y-4">
            {starsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : starredBills && starredBills.length > 0 ? (
              <div className="space-y-4">
                {starredBills.map((star) => (
                  <Card key={star.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline">{star.bill.billNumber}</Badge>
                            <Badge variant="secondary">{star.bill.topic}</Badge>
                          </div>
                          <h3 className="font-medium line-clamp-2" data-testid={`text-starred-bill-${star.billId}`}>
                            {star.bill.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Starred {formatDate(star.createdAt)}
                          </p>
                        </div>
                        <Link href={`/bill/${star.billId}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-view-bill-${star.billId}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No starred bills yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Star bills you want to follow to see them here.
                  </p>
                  <Link href="/dashboard">
                    <Button data-testid="button-browse-bills-empty">Browse Bills</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : userComments && userComments.length > 0 ? (
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {comment.bill && (
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{comment.bill.billNumber}</span>
                              <span className="text-sm text-muted-foreground line-clamp-1">
                                {comment.bill.title}
                              </span>
                            </div>
                          )}
                          <p className="text-sm" data-testid={`text-comment-${comment.id}`}>
                            {comment.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(comment.timestamp)}
                          </p>
                        </div>
                        {comment.bill && (
                          <Link href={`/bill/${comment.billId}`}>
                            <Button variant="ghost" size="icon">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No comments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your thoughts on bills to see your comments here.
                  </p>
                  <Link href="/dashboard">
                    <Button data-testid="button-browse-bills-comments">Browse Bills</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
