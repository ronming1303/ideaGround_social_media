import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Eye, EyeOff, TrendingUp, TrendingDown,
  ShoppingCart, Sparkles, ArrowUpRight,
  BarChart3, Target, Zap, ChevronRight
} from "lucide-react";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";

export default function Watchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/watchlist`, { withCredentials: true });
      setWatchlist(response.data);
      // Auto-select first item if none selected
      if (response.data?.items?.length > 0 && !selectedItem) {
        setSelectedItem(response.data.items[0]);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      if (loading) toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }, [loading, selectedItem]);

  // Initial fetch
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Auto-refresh polling (every 15 seconds)
  const { refresh: manualRefresh } = useDataSync(
    fetchWatchlist,
    POLL_INTERVALS.NORMAL,
    !loading
  );

  const handleRemove = async (videoId) => {
    try {
      await axios.post(
        `${API}/watchlist/remove`,
        { video_id: videoId },
        { withCredentials: true }
      );
      toast.success("Removed from watchlist");
      if (selectedItem?.video?.video_id === videoId) {
        setSelectedItem(null);
      }
      manualRefresh();
    } catch (error) {
      toast.error("Failed to remove from watchlist");
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || "0";
  };

  // Calculate investment score (simple heuristic)
  const getInvestmentScore = (item) => {
    let score = 50; // Base score
    
    // Price momentum (negative is good for buying)
    if (item.price_change < 0) score += 15;
    else if (item.price_change > 10) score -= 10;
    
    // Early bonus available
    if (item.early_tier_available) score += 20;
    
    // Scarcity (more shares sold = more proven)
    const sharesSold = ((item.video.total_shares - item.video.available_shares) / item.video.total_shares) * 100;
    if (sharesSold > 30 && sharesSold < 70) score += 10;
    
    // Engagement (views)
    if (item.video.views > 100000) score += 10;
    else if (item.video.views > 10000) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return "Strong Buy";
    if (score >= 50) return "Consider";
    return "Wait";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] orange-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-muted-foreground">Loading watchlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter p-6 lg:p-8 max-w-7xl mx-auto min-h-screen orange-gradient-subtle" data-testid="watchlist-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center orange-glow">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold gradient-text">My Watchlist</h1>
            <p className="text-muted-foreground">
              Track and analyze videos before investing
            </p>
          </div>
        </div>
      </div>

      {watchlist?.items?.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Watchlist Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Watched Videos
                    <Badge variant="secondary">{watchlist.count}</Badge>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {watchlist.items.map((item) => (
                    <div 
                      key={item.watchlist_id}
                      data-testid={`watchlist-item-${item.video.video_id}`}
                      onClick={() => setSelectedItem(item)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                        selectedItem?.video?.video_id === item.video.video_id 
                          ? 'bg-orange-500/10 border-l-4 border-l-orange-500' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 relative">
                        <img 
                          src={item.video.thumbnail} 
                          alt={item.video.title}
                          className="w-24 h-16 rounded-lg object-cover"
                        />

                      </div>
                      
                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.creator?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.early_tier_available && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30 px-1.5 py-0">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              {item.early_bonus_available}x
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold">${item.current_price.toFixed(2)}</p>
                        <div className={`flex items-center justify-end gap-0.5 text-xs ${
                          item.price_change >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {item.price_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {item.price_change >= 0 ? '+' : ''}{item.price_change_percent.toFixed(1)}%
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Thesis Card - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {selectedItem ? (
                <>
                  {/* Investment Thesis Card */}
                  <Card className="border-border/50 overflow-hidden" data-testid="investment-thesis-card">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                      <p className="text-xs text-white/70 mb-1">Investment Analysis</p>
                      <h3 className="font-heading font-bold text-lg truncate">{selectedItem.video.title}</h3>
                    </div>
                    
                    <CardContent className="p-4 space-y-4">
                      {/* Investment Score */}
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Investment Score</p>
                        <p className={`text-4xl font-heading font-bold ${getScoreColor(getInvestmentScore(selectedItem))}`}>
                          {getInvestmentScore(selectedItem)}
                        </p>
                        <Badge className={`mt-2 ${
                          getInvestmentScore(selectedItem) >= 70 ? 'bg-emerald-500' : 
                          getInvestmentScore(selectedItem) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        } text-white`}>
                          {getScoreLabel(getInvestmentScore(selectedItem))}
                        </Badge>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-orange-500" />
                          Key Metrics
                        </h4>
                        
                        {/* Price Momentum */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            {selectedItem.price_change >= 0 ? 
                              <TrendingUp className="w-4 h-4 text-emerald-500" /> : 
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            }
                            <span className="text-sm">Price Momentum</span>
                          </div>
                          <span className={`font-mono text-sm font-medium ${
                            selectedItem.price_change >= 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {selectedItem.price_change >= 0 ? '+' : ''}{selectedItem.price_change_percent.toFixed(1)}%
                          </span>
                        </div>

                        {/* Engagement */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Views</span>
                          </div>
                          <span className="font-mono text-sm font-medium">
                            {formatViews(selectedItem.video.views)}
                          </span>
                        </div>

                        {/* Scarcity */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">Available Shares</span>
                          </div>
                          <span className="font-mono text-sm font-medium">
                            {selectedItem.video.available_shares}/{selectedItem.video.total_shares}
                          </span>
                        </div>

                        {/* Early Bonus */}
                        {selectedItem.early_tier_available && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-medium text-amber-700">Early Bonus</span>
                            </div>
                            <span className="font-mono text-sm font-bold text-amber-600">
                              {selectedItem.early_bonus_available}x
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Investment Thesis */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Why Invest?
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-1.5">
                          {selectedItem.price_change < 0 && (
                            <p className="flex items-start gap-2">
                              <span className="text-emerald-500">✓</span>
                              Price is down {Math.abs(selectedItem.price_change_percent).toFixed(1)}% - potential buying opportunity
                            </p>
                          )}
                          {selectedItem.early_tier_available && (
                            <p className="flex items-start gap-2">
                              <span className="text-emerald-500">✓</span>
                              Early investor bonus still available ({selectedItem.early_bonus_available}x on profits)
                            </p>
                          )}
                          {selectedItem.video.views > 10000 && (
                            <p className="flex items-start gap-2">
                              <span className="text-emerald-500">✓</span>
                              Strong engagement with {formatViews(selectedItem.video.views)} views
                            </p>
                          )}
                          {selectedItem.video.available_shares < selectedItem.video.total_shares * 0.5 && (
                            <p className="flex items-start gap-2">
                              <span className="text-emerald-500">✓</span>
                              Limited availability - {selectedItem.video.available_shares} shares left
                            </p>
                          )}
                          {selectedItem.price_change >= 0 && selectedItem.price_change < 5 && (
                            <p className="flex items-start gap-2">
                              <span className="text-amber-500">○</span>
                              Price is stable - low volatility entry
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2">
                        <Link to={`/video/${selectedItem.video.video_id}`} className="block">
                          <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Shares
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full rounded-xl"
                          onClick={() => handleRemove(selectedItem.video.video_id)}
                        >
                          <EyeOff className="w-4 h-4 mr-2" />
                          Remove from Watchlist
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price History Mini */}
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Added at</span>
                        <span className="font-mono">${selectedItem.price_when_added.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Current price</span>
                        <span className="font-mono font-bold">${selectedItem.current_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Change since added</span>
                        <span className={`font-mono font-bold ${
                          selectedItem.price_change >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {selectedItem.price_change >= 0 ? '+' : ''}${selectedItem.price_change.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a video to see investment analysis</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start watching videos to track their prices and get investment analysis
            </p>
            <Link to="/dashboard">
              <Button className="rounded-full">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Browse Videos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
