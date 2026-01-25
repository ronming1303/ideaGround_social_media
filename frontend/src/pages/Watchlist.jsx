import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Eye, EyeOff, TrendingUp, TrendingDown, Clock, 
  ShoppingCart, Sparkles, ArrowUpRight, PlayCircle
} from "lucide-react";

export default function Watchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(`${API}/watchlist`, { withCredentials: true });
      setWatchlist(response.data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (videoId) => {
    try {
      await axios.post(
        `${API}/watchlist/remove`,
        { video_id: videoId },
        { withCredentials: true }
      );
      toast.success("Removed from watchlist");
      fetchWatchlist(); // Refresh
    } catch (error) {
      toast.error("Failed to remove from watchlist");
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || "0";
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
              Track videos you&apos;re interested in before investing
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {watchlist && watchlist.count > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
          <Card className="border-border/50 card-hover-orange">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Watching</p>
              <p className="text-2xl font-heading font-bold gradient-text">{watchlist.count}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 card-hover-orange">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Price Drops</p>
              <p className="text-2xl font-heading font-bold text-emerald-600">
                {watchlist.items.filter(i => i.price_change < 0).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 card-hover-orange">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Early Bonus Available</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {watchlist.items.filter(i => i.early_tier_available).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Already Owned</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {watchlist.items.filter(i => i.user_owns_shares).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Watchlist Items */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Watched Videos
            {watchlist && <Badge variant="secondary">{watchlist.count}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist?.items?.length > 0 ? (
            <div className="space-y-4">
              {watchlist.items.map((item) => (
                <div 
                  key={item.watchlist_id}
                  data-testid={`watchlist-item-${item.video.video_id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Thumbnail */}
                  <Link to={`/video/${item.video.video_id}`} className="flex-shrink-0 relative group">
                    <img 
                      src={item.video.thumbnail} 
                      alt={item.video.title}
                      className="w-28 h-20 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="absolute bottom-1 right-1 text-xs bg-black/70">
                      {item.video.duration_minutes}m
                    </Badge>
                  </Link>
                  
                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${item.video.video_id}`}>
                      <h4 className="font-medium truncate hover:text-primary transition-colors">
                        {item.video.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.creator?.name} • {formatViews(item.video.views)} views
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.early_tier_available && (
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {item.early_bonus_available}x Bonus
                        </Badge>
                      )}
                      {item.user_owns_shares && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          Owns {item.shares_owned} shares
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Price Info */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading font-bold text-lg">
                      ${item.current_price.toFixed(2)}
                    </p>
                    <div className={`flex items-center justify-end gap-1 text-sm ${
                      item.price_change >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {item.price_change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {item.price_change >= 0 ? '+' : ''}{item.price_change_percent.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added at ${item.price_when_added.toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link to={`/video/${item.video.video_id}`}>
                      <Button 
                        size="sm" 
                        className="rounded-full w-full"
                        data-testid={`buy-btn-${item.video.video_id}`}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemove(item.video.video_id)}
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      data-testid={`remove-btn-${item.video.video_id}`}
                    >
                      <EyeOff className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">Your watchlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Start watching videos to track their prices before investing
              </p>
              <Link to="/dashboard">
                <Button className="rounded-full">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Browse Videos
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      {watchlist?.items?.length > 0 && (
        <Card className="border-border/50 mt-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Investment Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Videos with price drops might be good buying opportunities</li>
                  <li>• Look for videos with Early Investor Bonus still available</li>
                  <li>• The sooner you invest, the higher your potential bonus multiplier</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
