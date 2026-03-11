import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  Heart, Share2, Bell, TrendingUp,
  Eye, ArrowLeft, ShoppingCart,
  Award, Users, PieChart, EyeOff
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";
import VideoComments from "../components/VideoComments";

export default function VideoPlayer() {
  const { videoId } = useParams();
  const { user, setUser } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [watching, setWatching] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [buying, setBuying] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sharesToSell, setSharesToSell] = useState(1);
  const [selling, setSelling] = useState(false);
  const [topEarners, setTopEarners] = useState(null);
  const [volumeHistory, setVolumeHistory] = useState([]);

  const fetchVideo = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}`, { withCredentials: true });
      setVideo(response.data);
      setLiked(response.data.user_liked || false);
      setLikesCount(response.data.likes);
      setSubscribed(response.data.creator?.is_subscribed || false);
      setWatching(response.data.user_watching || false);
    } catch (error) {
      console.error("Error fetching video:", error);
      if (loading) toast.error("Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [videoId, loading]);

  const fetchTopEarners = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}/top-earners`, { withCredentials: true });
      setTopEarners(response.data);
    } catch (error) {
      console.log("Top earners not available");
    }
  }, [videoId]);

  const fetchVolumeHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}/volume`, { withCredentials: true });
      setVolumeHistory(response.data.volume_history || []);
    } catch (error) {
      console.log("Volume history not available");
    }
  }, [videoId]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchVideo();
    fetchTopEarners();
    fetchVolumeHistory();
  }, [videoId]);

  // Auto-refresh polling (every 10 seconds for video page - more critical)
  // TODO: Replace with WebSocket for real-time updates
  useDataSync(
    useCallback(async () => {
      await Promise.all([fetchVideo(), fetchTopEarners()]);
    }, [fetchVideo, fetchTopEarners]),
    POLL_INTERVALS.FAST, // 5 seconds for video page
    !loading // Only poll after initial load
  );

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

  const handleWatchlist = async () => {
    try {
      if (watching) {
        await axios.post(
          `${API}/watchlist/remove`,
          { video_id: videoId },
          { withCredentials: true }
        );
        setWatching(false);
        toast.success("Removed from watchlist");
      } else {
        const response = await axios.post(
          `${API}/watchlist/add`,
          { video_id: videoId },
          { withCredentials: true }
        );
        setWatching(true);
        toast.success(`Added to watchlist at $${response.data.price_when_added.toFixed(2)}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update watchlist");
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
      fetchVideo();
      fetchTopEarners();
      if (user) setUser({ ...user, wallet_balance: response.data.new_wallet_balance });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to buy shares");
    } finally {
      setBuying(false);
    }
  };

  const handleSellShares = async () => {
    if (sharesToSell <= 0 || sharesToSell > (video.user_shares || 0)) {
      toast.error("Invalid share amount");
      return;
    }
    setSelling(true);
    try {
      const response = await axios.post(
        `${API}/shares/sell`,
        { video_id: videoId, shares: sharesToSell },
        { withCredentials: true }
      );
      toast.success(`Sold ${sharesToSell} shares for $${response.data.total_value.toFixed(2)}`);
      setSellDialogOpen(false);
      fetchVideo();
      fetchTopEarners();
      const meRes = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(meRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to sell shares");
    } finally {
      setSelling(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };


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
        {/* Video embed */}
        <div className="lg:col-span-2 order-1">
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={video.video_url}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Stock Trading Card - spans both rows on desktop, appears 2nd on mobile */}
        {/* (trading card section rendered below) */}

        {/* Video info */}
        <div className="lg:col-span-2 space-y-6 order-3">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
<h1 className="font-heading text-2xl lg:text-3xl font-bold">{video.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViews(video.views)} views
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
              <Button 
                data-testid="watch-btn"
                variant={watching ? "default" : "outline"}
                onClick={handleWatchlist}
                className={`rounded-full ${watching ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
              >
                {watching ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Watching
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Watch
                  </>
                )}
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

            {/* Comments Section */}
            <div className="mt-6">
              <VideoComments videoId={videoId} />
            </div>
          </div>
        </div>

        {/* Stock Trading Card - Clean & Simple */}
        <div className="space-y-6 order-2 lg:row-span-2">
          <Card className="border-border/50 overflow-hidden shadow-lg" data-testid="trading-card">
            {/* Ticker Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 font-mono text-lg px-3">
                  ${video.ticker_symbol || (video.creator?.stock_symbol || 'VID')}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold">${video.share_price.toFixed(2)}</span>
                <span className="text-white/70 text-sm">per share</span>
              </div>
            </div>
            
            <CardContent className="p-5">
              {/* Trading Volume Chart */}
              <div className="mb-2">
                <p className="text-xs text-muted-foreground mb-2">Trading Volume</p>
                {volumeHistory.length > 0 ? (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeHistory} barSize={8}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                                  <p className="text-muted-foreground mb-1">{d.date}</p>
                                  <p className="text-emerald-600">Buy: {d.buy} shares</p>
                                  {d.sell > 0 && <p className="text-orange-500">Sell: {d.sell} shares</p>}
                                  <p className="font-medium">{d.traders} trader{d.traders !== 1 ? 's' : ''}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="buy" fill="hsl(173, 58%, 39%)" radius={[2,2,0,0]} />
                        <Bar dataKey="sell" fill="hsl(24, 95%, 53%)" radius={[2,2,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    No trading activity yet
                  </div>
                )}
              </div>

              {/* Simple Stats - Clear Labels */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Available Shares</p>
                  <p className="font-mono text-2xl font-bold">{video.available_shares.toFixed(0)}<span className="text-sm text-muted-foreground font-normal">/{video.total_shares}</span></p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">You Own</p>
                  <p className="font-mono text-2xl font-bold">{video.user_shares || 0} <span className="text-sm text-muted-foreground font-normal">shares</span></p>
                </div>
              </div>

              {/* BUY BUTTON */}
              <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    data-testid="buy-shares-btn"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01]"
                    disabled={video.available_shares <= 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {video.available_shares <= 0 ? 'SOLD OUT' : 'Buy Shares'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-xl">Buy Shares</DialogTitle>
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

                    {/* Share selection */}
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

                    {/* Order Summary */}
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Price per share</span>
                        <span className="font-mono">${video.share_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="font-mono">× {sharesToBuy}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-medium">Total</span>
                        <span className="font-heading font-bold text-xl">${(video.share_price * sharesToBuy).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <Button 
                      data-testid="confirm-buy-btn"
                      onClick={handleBuyShares}
                      disabled={buying || (user?.wallet_balance < video.share_price * sharesToBuy)}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6"
                    >
                      {buying ? "Processing..." : `Buy ${sharesToBuy} Shares`}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Your balance: ${user?.wallet_balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* SELL BUTTON - only show if user owns shares */}
              {(video.user_shares || 0) > 0 && (
                <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-3 rounded-xl py-5 text-base font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      Sell Shares ({video.user_shares} owned)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl">Sell Shares</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                        <img src={video.thumbnail} alt={video.title} className="w-20 h-14 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium line-clamp-1">{video.title}</p>
                          <p className="text-sm text-muted-foreground">${video.share_price.toFixed(2)} per share</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Shares to Sell</label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[sharesToSell]}
                            onValueChange={(value) => setSharesToSell(value[0])}
                            max={video.user_shares}
                            min={1}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={sharesToSell}
                            onChange={(e) => setSharesToSell(Math.min(Math.max(1, Number(e.target.value)), video.user_shares))}
                            className="w-20 text-center font-mono"
                          />
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">Price per share</span>
                          <span className="font-mono">${video.share_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">Shares</span>
                          <span className="font-mono">× {sharesToSell}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="font-medium">You receive</span>
                          <span className="font-heading font-bold text-xl text-emerald-600">+${(video.share_price * sharesToSell).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={handleSellShares}
                        disabled={selling}
                        className="w-full bg-destructive hover:bg-destructive/90 text-white rounded-full py-6"
                      >
                        {selling ? "Processing..." : `Sell ${sharesToSell} Shares`}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

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
                  <span className="font-mono text-sm font-medium">80%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="text-sm">Shareholders</span>
                  </div>
                  <span className="font-mono text-sm font-medium">10%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">Supporters</span>
                  </div>
                  <span className="font-mono text-sm font-medium">10%</span>
                </div>
              </div>
              {/* Visual bar */}
              <div className="flex h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-primary" style={{ width: '80%' }} />
                <div className="bg-secondary" style={{ width: '10%' }} />
                <div className="bg-muted-foreground" style={{ width: '10%' }} />
              </div>
            </CardContent>
          </Card>

          {/* Top Earners Leaderboard */}
          {topEarners && topEarners.total_investors > 0 && (
            <Card className="border-border/50" data-testid="top-earners-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Top Earners</h4>
                      <p className="text-xs text-muted-foreground">{topEarners.total_investors} investor{topEarners.total_investors !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {topEarners.top_earners.map((earner) => (
                    <div 
                      key={earner.user_id}
                      data-testid={`earner-${earner.rank}`}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        earner.user_id === user?.user_id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        earner.rank === 1 
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' 
                          : earner.rank === 2 
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                            : earner.rank === 3 
                              ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                              : 'bg-muted text-muted-foreground'
                      }`}>
                        {earner.rank}
                      </div>
                      
                      {/* Avatar */}
                      <div className="relative">
                        {earner.picture ? (
                          <img 
                            src={earner.picture} 
                            alt={earner.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Name & Shares */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {earner.user_id === user?.user_id ? 'You' : earner.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {earner.shares_owned} share{earner.shares_owned !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                    </div>
                  ))}
                </div>
                
                {/* User's Position (if not in top 5) */}
                {user && topEarners.top_earners.length > 0 && 
                 !topEarners.top_earners.find(e => e.user_id === user.user_id) && 
                 video.user_shares > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      You own {video.user_shares} shares of this video
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
