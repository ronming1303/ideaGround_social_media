import { useState, useEffect } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageSquare, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { cn } from "../lib/utils";

export default function VideoComments({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}/comments`, { withCredentials: true });
      setComments(response.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    setPosting(true);
    try {
      const response = await axios.post(
        `${API}/comments`,
        { video_id: videoId, content: newComment },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setNewComment("");
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleVote = async (commentId, voteType) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/comments/vote`,
        { comment_id: commentId, vote_type: voteType },
        { withCredentials: true }
      );
      setComments(prev => prev.map(c => {
        if (c.comment_id === commentId) {
          return {
            ...c,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes,
            net_votes: response.data.net_votes,
            user_voted: true
          };
        }
        return c;
      }));
      toast.success(voteType === "up" ? "Upvoted!" : "Downvoted");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to vote");
    }
  };

  const formatTimeAgo = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-border/50" data-testid="video-comments">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Comment Input */}
        <div className="space-y-2">
          <Textarea
            data-testid="comment-input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/500
            </span>
            <Button
              data-testid="post-comment-btn"
              onClick={handlePostComment}
              disabled={posting || !newComment.trim()}
              size="sm"
              className="rounded-full"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {posting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-6 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.comment_id}
                data-testid={`comment-${comment.comment_id}`}
                className={cn(
                  "p-3 rounded-xl border transition-colors",
                  comment.is_own_comment
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  {comment.user_picture ? (
                    <img
                      src={comment.user_picture}
                      alt={comment.user_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {comment.user_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {comment.is_own_comment ? "You" : comment.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          data-testid={`upvote-${comment.comment_id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(comment.comment_id, "up")}
                          disabled={comment.user_voted || comment.is_own_comment}
                          className={cn(
                            "h-7 px-2 rounded-full",
                            comment.net_votes > 0 && "text-emerald-600"
                          )}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          {comment.upvotes}
                        </Button>
                        <Button
                          data-testid={`downvote-${comment.comment_id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(comment.comment_id, "down")}
                          disabled={comment.user_voted || comment.is_own_comment}
                          className={cn(
                            "h-7 px-2 rounded-full",
                            comment.net_votes < 0 && "text-red-500"
                          )}
                        >
                          <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                          {comment.downvotes}
                        </Button>
                      </div>

                      <span className={cn(
                        "text-xs font-mono",
                        comment.net_votes > 0 ? "text-emerald-600" :
                        comment.net_votes < 0 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        {comment.net_votes > 0 ? "+" : ""}{comment.net_votes} net
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
