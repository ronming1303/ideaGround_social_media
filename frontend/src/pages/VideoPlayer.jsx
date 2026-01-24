import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Play, Heart, Share2, Bell, TrendingUp, TrendingDown, 
  Eye, Clock, DollarSign, ArrowLeft, ShoppingCart, ChevronUp, ChevronDown,
  Award, Users, Sparkles, PieChart
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function VideoPlayer() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}`, { withCredentials: true });
      setVideo(response.data);
      setLiked(response.data.user_liked || false);
      setLikesCount(response.data.likes);
      setSubscribed(response.data.creator?.is_subscribed || false);
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`${API}/videos/${videoId}/like`, {}, { withCredentials: true });
      setLiked(response.data.liked);
      setLikesCount(response.data.likes);
      toast.success(response.data.liked ? "Liked!" : "Unliked");
    } catch (error) {
      toast.error("Failed to like video");
    }
  };

  const handleSubscribe = async () => {
    if (!video?.creator) return;
    try {
      const response = await axios.post(
        `${API}/creators/${video.creator.creator_id}/subscribe`, 
        {}, 
        { withCredentials: true }
      );
      setSubscribed(response.data.subscribed);
      toast.success(response.data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch (error) {
      toast.error("Failed to subscribe");
    }
  };

  const handleBuyShares = async () => {
    if (sharesToBuy <= 0 || sharesToBuy > video.available_shares) {
      toast.error("Invalid share amount");
      return;
    }

    setBuying(true);
    try {
      const response = await axios.post(
        `${API}/shares/buy`,
        { video_id: videoId, shares: sharesToBuy },
        { withCredentials: true }
      );
      
      // Show different message based on early investor status
      if (response.data.is_early_investor) {
        toast.success(
          `Early Investor Bonus! Bought ${sharesToBuy} shares with ${response.data.early_bonus_multiplier}x bonus multiplier!`,
          { duration: 5000 }
        );
      } else {
        toast.success(`Successfully bought ${sharesToBuy} shares for $${response.data.total_cost.toFixed(2)}`);
      }
      
      setBuyDialogOpen(false);
      fetchVideo(); // Refresh video data
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to buy shares");
    } finally {
      setBuying(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  const priceChange = video?.price_history?.length > 1 
    ? ((video.share_price - video.price_history[0].price) / video.price_history[0].price * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Video not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back button */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video player column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video embed */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={video.video_url}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge className="mb-2" variant={video.video_type === 'short' ? 'default' : 'secondary'}>
                  {video.video_type === 'short' ? 'Short' : 'Full Video'}
                </Badge>
                <h1 className="font-heading text-2xl lg:text-3xl font-bold">{video.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViews(video.views)} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {video.duration_minutes} min
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button 
                data-testid="like-btn"
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                className={`rounded-full ${liked ? 'bg-primary text-white' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                {formatViews(likesCount)}
              </Button>
              <Button data-testid="share-btn" variant="outline" className="rounded-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Creator info */}
            {video.creator && (
              <div className="flex items-center justify-between mt-6 p-4 rounded-2xl bg-muted/50">
                <Link 
                  to={`/creator/${video.creator.creator_id}`}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={video.creator.image} 
                    alt={video.creator.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{video.creator.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatViews(video.creator.subscriber_count)} subscribers
                    </p>
                  </div>
                </Link>
                <Button 
                  data-testid="subscribe-btn"
                  onClick={handleSubscribe}
                  variant={subscribed ? "outline" : "default"}
                  className={`rounded-full ${!subscribed ? 'bg-primary text-white' : ''}`}
                >
                  <Bell className={`w-4 h-4 mr-2 ${subscribed ? 'fill-current' : ''}`} />
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </div>
            )}

            {/* Description */}
            <div className="mt-6 p-4 rounded-2xl bg-muted/50">
              <p className="text-muted-foreground">{video.description}</p>
            </div>
          </div>
        </div>

        {/* Stock ticker column */}
        <div className="space-y-6">
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold">${video.share_price.toFixed(2)}</span>
                    <span className={`flex items-center text-sm font-medium ${priceChange >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {priceChange >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {Math.abs(priceChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {video.creator && (
                  <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                    {video.creator.stock_symbol}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Price chart */}
              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={video.price_history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={priceChange >= 0 ? "hsl(173, 58%, 39%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={priceChange >= 0 ? "hsl(173, 58%, 39%)" : "hsl(0, 84%, 60%)"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                              <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                              <p className="font-mono font-medium">${payload[0].value.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={priceChange >= 0 ? "hsl(173, 58%, 39%)" : "hsl(0, 84%, 60%)"}
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stock stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Available Shares</p>
                  <p className="font-mono font-semibold">{video.available_shares.toFixed(0)}/{video.total_shares}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">You Own</p>
                  <p className="font-mono font-semibold">{video.user_shares || 0} shares</p>
                </div>
              </div>

              {/* Buy button */}
              <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    data-testid="buy-shares-btn"
                    className="w-full bg-primary text-white hover:bg-primary/90 rounded-full py-6 text-lg font-medium"
                    disabled={video.available_shares <= 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Shares
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Buy Shares</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-20 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{video.title}</p>
                        <p className="text-sm text-muted-foreground">${video.share_price.toFixed(2)} per share</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Number of Shares</label>
                      <div className="flex items-center gap-4">
                        <Slider
                          data-testid="shares-slider"
                          value={[sharesToBuy]}
                          onValueChange={(value) => setSharesToBuy(value[0])}
                          max={Math.min(video.available_shares, 20)}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          data-testid="shares-input"
                          type="number"
                          value={sharesToBuy}
                          onChange={(e) => setSharesToBuy(Math.min(Math.max(1, Number(e.target.value)), video.available_shares))}
                          className="w-20 text-center font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-accent">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Price per share</span>
                        <span className="font-mono">${video.share_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="font-mono">x{sharesToBuy}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-medium">Total</span>
                        <span className="font-heading font-bold text-lg">${(video.share_price * sharesToBuy).toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      data-testid="confirm-buy-btn"
                      onClick={handleBuyShares}
                      disabled={buying}
                      className="w-full bg-primary text-white hover:bg-primary/90 rounded-full py-6"
                    >
                      {buying ? "Processing..." : `Buy ${sharesToBuy} Shares`}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Your wallet balance: ${user?.wallet_balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Early Discovery Bonus Card */}
          {video.early_investor_tier && (
            <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Early Discovery Bonus</h4>
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
                        {video.early_investor_tier.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Only {video.shares_sold_percent.toFixed(0)}% shares sold. Invest now for a <span className="font-semibold text-amber-600">{video.early_bonus_available}x bonus</span> on profits!
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(video.shares_sold_percent, 30)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Early bonus ends at 30% sold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Early Investor Status */}
          {video.user_is_early_investor && video.user_shares > 0 && (
            <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-700 mb-1">You're an Early Investor!</h4>
                    <p className="text-sm text-muted-foreground">
                      Your {video.user_shares} shares qualify for a <span className="font-semibold text-emerald-600">{video.user_early_bonus}x bonus</span> on any profits when you sell.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Split Card - Transparent Distribution */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Revenue Distribution</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                How earnings from this video are shared
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm">Creator</span>
                  </div>
                  <span className="font-mono text-sm font-medium">50%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="text-sm">Shareholders</span>
                  </div>
                  <span className="font-mono text-sm font-medium">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">Platform</span>
                  </div>
                  <span className="font-mono text-sm font-medium">10%</span>
                </div>
              </div>
              {/* Visual bar */}
              <div className="flex h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-primary" style={{ width: '50%' }} />
                <div className="bg-secondary" style={{ width: '40%' }} />
                <div className="bg-muted-foreground" style={{ width: '10%' }} />
              </div>
            </CardContent>
          </Card>

          {/* Investment tip */}
          <Card className="border-border/50 bg-gradient-to-br from-secondary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Investment Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Videos with high engagement tend to appreciate faster. This video has {formatViews(video.likes)} likes!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
