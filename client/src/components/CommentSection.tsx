import { useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, ArrowUp, Reply, MapPin, Shield } from "lucide-react";

const MAX_COMMENT_LENGTH = 1000;
const RATE_LIMIT_MS = 30000;
const BLOCKED_WORDS = ["spam", "scam", "idiot", "stupid", "moron", "dumb"];

function containsBlockedWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.some(word => lowerText.includes(word));
}

export interface Comment {
  id: string;
  author: string;
  authorInitials: string;
  neighborhood: string;
  content: string;
  timestamp: string;
  upvotes: number;
  isModerator?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onUpvote: (commentId: string) => void;
  isLoggedIn: boolean;
}

function CommentItem({ 
  comment, 
  depth = 0, 
  onUpvote, 
  isLoggedIn 
}: { 
  comment: Comment; 
  depth?: number; 
  onUpvote: (id: string) => void;
  isLoggedIn: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes);

  const handleUpvote = () => {
    if (!isLoggedIn) return;
    setUpvoted(!upvoted);
    setUpvoteCount((prev) => (upvoted ? prev - 1 : prev + 1));
    onUpvote(comment.id);
  };

  return (
    <div className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-border" : ""}`}>
      <div className="py-4" data-testid={`comment-${comment.id}`}>
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="text-sm font-medium">{comment.authorInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-medium text-lg text-foreground" data-testid={`text-comment-author-${comment.id}`}>
                {comment.author}
              </span>
              {comment.isModerator && (
                <Badge variant="outline" className="text-xs gap-1 bg-primary/10 text-primary border-primary/30">
                  <Shield className="h-3 w-3" />
                  Moderator
                </Badge>
              )}
              <Badge variant="outline" className="text-xs gap-1" data-testid={`badge-neighborhood-${comment.id}`}>
                <MapPin className="h-3 w-3" />
                {comment.neighborhood}
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid={`text-comment-time-${comment.id}`}>
                {comment.timestamp}
              </span>
            </div>
            <p className="text-lg text-foreground leading-relaxed mb-3" data-testid={`text-comment-content-${comment.id}`}>
              {comment.content}
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                disabled={!isLoggedIn}
                className={`text-base ${upvoted ? "text-accent" : "text-muted-foreground"}`}
                data-testid={`button-upvote-${comment.id}`}
              >
                <ArrowUp className={`h-5 w-5 mr-1 ${upvoted ? "fill-current" : ""}`} />
                {upvoteCount}
              </Button>
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReply(!showReply)}
                  className="text-muted-foreground text-base"
                  data-testid={`button-reply-${comment.id}`}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>

        {showReply && (
          <div className="mt-4 ml-14">
            <Textarea
              placeholder="Write a reply..."
              className="mb-2 text-base min-h-20"
              data-testid={`input-reply-${comment.id}`}
            />
            <div className="flex gap-2">
              <Button size="sm" data-testid={`button-submit-reply-${comment.id}`}>
                <Send className="h-4 w-4 mr-1" />
                Reply
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowReply(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem 
          key={reply.id} 
          comment={reply} 
          depth={depth + 1} 
          onUpvote={onUpvote}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}

export function CommentSection({ comments, onAddComment, onUpvote, isLoggedIn }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const lastSubmitRef = useRef<number>(0);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setNewComment(value);
      setError("");
    }
  };

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    if (containsBlockedWords(trimmed)) {
      setError("Please keep comments respectful and constructive.");
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      const secondsLeft = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitRef.current)) / 1000);
      setError(`Please wait ${secondsLeft} seconds before posting again.`);
      return;
    }

    lastSubmitRef.current = now;
    onAddComment(trimmed);
    setNewComment("");
    setError("");
  };

  const charsRemaining = MAX_COMMENT_LENGTH - newComment.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
        <h3 className="text-2xl font-medium text-foreground">
          Community Discussion ({comments.length})
        </h3>
      </div>

      {isLoggedIn && (
        <div className="mb-6">
          <Textarea
            placeholder="Share your thoughts on this legislation..."
            value={newComment}
            onChange={handleCommentChange}
            maxLength={MAX_COMMENT_LENGTH}
            className="mb-2 text-lg min-h-28"
            data-testid="input-new-comment"
            aria-describedby="comment-char-count"
          />
          <div className="flex items-center justify-between mb-3">
            <span 
              id="comment-char-count"
              className={`text-sm ${charsRemaining < 100 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {charsRemaining} characters remaining
            </span>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
          <Button onClick={handleSubmit} size="lg" disabled={!newComment.trim()} data-testid="button-submit-comment">
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>
      )}

      <div className="divide-y divide-border">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-lg text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onUpvote={onUpvote}
              isLoggedIn={isLoggedIn}
            />
          ))
        )}
      </div>
    </div>
  );
}
