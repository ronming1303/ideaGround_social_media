import { useState, useEffect } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Gift, Send, 
  Sparkles, Trophy, Award, Star
} from "lucide-react";
import { cn } from "../lib/utils";

export default function VideoComments({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [rewardTiers, setRewardTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [showTiers, setShowTiers] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}/comments`, { withCredentials: true });
      setComments(response.data.comments);
      setRewardTiers(response.data.reward_tiers);
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
      
      // Update local state
      setComments(prev => prev.map(c => {
        if (c.comment_id === commentId) {
          return {
            ...c,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes,
            net_votes: response.data.net_votes,
            potential_reward: response.data.potential_reward,
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

  const handleClaimReward = async (commentId) => {
    try {
      const response = await axios.post(
        `${API}/comments/${commentId}/claim-reward`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message, { duration: 5000 });
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to claim reward");
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

  const getRewardBadge = (netVotes, potentialReward) => {
    if (potentialReward >= 0.5) return { icon: Trophy, color: "text-amber-500", label: "Gold" };
    if (potentialReward >= 0.25) return { icon: Award, color: "text-gray-400", label: "Silver" };
    if (potentialReward >= 0.1) return { icon: Star, color: "text-orange-600", label: "Bronze" };
    if (potentialReward >= 0.05) return { icon: Sparkles, color: "text-purple-500", label: "Rising" };
    return null;
  };

  return (
    <Card className="border-border/50" data-testid="video-comments">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comments ({comments.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTiers(!showTiers)}
            className="text-xs"
          >
            <Gift className="w-3.5 h-3.5 mr-1" />
            Reward Tiers
          </Button>
        </div>
        
        {/* Reward Tiers Info */}
        {showTiers && (
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-2">
              🎁 Earn micro-shares for popular comments!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {rewardTiers.map((tier, i) => (
                <div key={i} className="p-2 rounded bg-white/50 text-center">
                  <p className="font-mono font-bold text-amber-600">{tier.shares} shares</p>
                  <p className="text-amber-700">{tier.min_votes}+ votes</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* New Comment Input */}
        <div className="space-y-2">
          <Textarea
            data-testid="comment-input"
            placeholder="Add a comment... Top comments earn micro-shares!"
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
            <p className="text-xs mt-1">Top comments earn micro-shares</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const rewardBadge = getRewardBadge(comment.net_votes, comment.potential_reward);
              const RewardIcon = rewardBadge?.icon;
              
              return (
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
                  {/* Comment Header */}
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
                        {rewardBadge && (
                          <Badge variant="outline" className={cn("text-[10px] px-1.5", rewardBadge.color)}>
                            <RewardIcon className="w-3 h-3 mr-0.5" />
                            {rewardBadge.label}
                          </Badge>
                        )}
                        {comment.micro_shares_earned > 0 && (
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">
                            <Sparkles className="w-3 h-3 mr-0.5" />
                            {comment.micro_shares_earned} earned
                          </Badge>
                        )}
                      </div>
                      
                      {/* Comment Content */}
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      
                      {/* Actions Row */}
                      <div className="flex items-center gap-3 mt-2">
                        {/* Vote Buttons */}
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
                        
                        {/* Net votes indicator */}
                        <span className={cn(
                          "text-xs font-mono",
                          comment.net_votes > 0 ? "text-emerald-600" : 
                          comment.net_votes < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {comment.net_votes > 0 ? "+" : ""}{comment.net_votes} net
                        </span>
                        
                        {/* Claim Reward Button */}
                        {comment.can_claim_reward && (
                          <Button
                            data-testid={`claim-reward-${comment.comment_id}`}
                            onClick={() => handleClaimReward(comment.comment_id)}
                            size="sm"
                            className="h-7 px-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                          >
                            <Gift className="w-3.5 h-3.5 mr-1" />
                            Claim {comment.potential_reward} shares!
                          </Button>
                        )}
                        
                        {/* Potential reward info */}
                        {comment.is_own_comment && !comment.can_claim_reward && comment.potential_reward > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Earning: {comment.potential_reward} shares
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
