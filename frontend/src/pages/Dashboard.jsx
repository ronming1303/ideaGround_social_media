import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Play, TrendingUp, Eye, Heart, Sparkles, ArrowUpRight, Wallet } from "lucide-react";
import TrendingTicker from "../components/TrendingTicker";
import MarketOverview from "../components/MarketOverview";
import LiveActivityFeed from "../components/LiveActivityFeed";

export default function Dashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioPerformance, setPortfolioPerformance] = useState(null);
  const [watchlistCount, setWatchlistCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [videosRes, creatorsRes] = await Promise.all([
        axios.get(`${API}/videos`, { withCredentials: true }),
        axios.get(`${API}/creators`, { withCredentials: true })
      ]);
      setVideos(videosRes.data);
      setCreators(creatorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Only show toast on initial load, not on poll failures
      if (loading) toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchPortfolioPerformance = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/portfolio/performance`, { withCredentials: true });
      setPortfolioPerformance(response.data);
    } catch (error) {
      // User might not be authenticated, that's okay
      console.log("Portfolio performance not available");
    }
  }, []);

  const fetchWatchlistCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/watchlist`, { withCredentials: true });
      setWatchlistCount(response.data.count || 0);
    } catch (error) {
      console.log("Watchlist not available");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
    fetchPortfolioPerformance();
    fetchWatchlistCount();
  }, []);

  const manualRefresh = useCallback(async () => {
    await Promise.all([fetchData(), fetchPortfolioPerformance(), fetchWatchlistCount()]);
  }, [fetchData, fetchPortfolioPerformance, fetchWatchlistCount]);

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  const VideoCard = ({ video }) => (
    <Link 
      to={`/video/${video.video_id}`}
      data-testid={`video-card-${video.video_id}`}
      className="group overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Thumbnail with minimal overlays */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Video Info - Below thumbnail (YouTube style) */}
      <div className="p-3">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug flex-1">
            {video.title}
          </h3>
          {/* Price badge */}
          <div className="flex-shrink-0 px-2 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600">
            ${video.share_price.toFixed(2)}
          </div>
        </div>

        {/* Creator info */}
        {video.creator && (
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={video.creator.image} 
              alt={video.creator.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground truncate">{video.creator.name}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViews(video.views)} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatViews(video.likes)}
          </span>
          {video.created_at && (
            <span>{new Date(video.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          )}
          {video.video_type === 'short' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              Short
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );

  const CreatorCard = ({ creator }) => (
    <Link 
      to={`/creator/${creator.creator_id}`}
      data-testid={`creator-card-${creator.creator_id}`}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:shadow-hover transition-all hover:-translate-y-0.5"
    >
      <img 
        src={creator.image} 
        alt={creator.name}
        className="w-14 h-14 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{creator.name}</h4>
        {creator.category && <p className="text-sm text-muted-foreground">{creator.category}</p>}
      </div>
      <div className="text-right">
        <p className="font-mono font-semibold text-secondary">${creator.stock_symbol}</p>
        <p className="text-xs text-muted-foreground">{formatViews(creator.subscriber_count)} subs</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center orange-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-muted-foreground">Loading content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter orange-gradient-subtle min-h-screen">
      {/* Trending Ticker */}
      <TrendingTicker />
      
      
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold gradient-text">
          Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Discover trending content and grow your portfolio</p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto">
        <Link to="/wallet" className="flex-1 min-w-0">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-lg font-heading font-bold truncate">${user?.wallet_balance?.toFixed(2) || '500.00'}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Wallet</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/portfolio" className="flex-1 min-w-0">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-lg font-heading font-bold truncate">${portfolioPerformance?.total_value?.toFixed(2) ?? '0.00'}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Portfolio</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/watchlist" className="flex-1 min-w-0">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-chart-4/20 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-chart-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-lg font-heading font-bold truncate">{watchlistCount || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Watchlist</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Content tabs */}
      {/* YouTube/Instagram Style Feed */}
      <div className="space-y-10">
        {/* Shorts Section - Horizontal scroll, vertical cards */}
        {videos.filter(v => v.video_type === 'short').length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-heading text-xl font-bold">Shorts</h2>
              </div>
              <Link to="/explore">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              {videos.filter(v => v.video_type === 'short').map((video) => (
                <Link key={video.video_id} to={`/shorts/${video.video_id}`} className="flex-shrink-0 group">
                  <div className="relative w-40 h-72 rounded-xl overflow-hidden bg-black shadow-lg">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-mono font-bold backdrop-blur-sm bg-emerald-500/80 text-white">
                      ${video.share_price.toFixed(2)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">{video.title}</h3>
                      <div className="flex items-center gap-2">
                        {video.creator && <img src={video.creator.image} alt={video.creator.name} className="w-5 h-5 rounded-full object-cover" />}
                        <span className="text-white/70 text-xs truncate">{video.creator?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-white/60 text-xs">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatViews(video.views)}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{formatViews(video.likes)}</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section - Grid layout */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-heading text-xl font-bold">Videos</h2>
            </div>
            <Link to="/explore">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {/* Main content with Live Activity sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Videos Grid - takes 3 columns on XL */}
            <div className="xl:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {videos.filter(v => v.video_type !== 'short').map((video) => (
                  <VideoCard key={video.video_id} video={video} />
                ))}
              </div>
            </div>
            
            {/* Live Activity Feed - sticky sidebar on XL screens */}
            <div className="xl:col-span-1">
              <div className="xl:sticky xl:top-24">
                <LiveActivityFeed />
              </div>
            </div>
          </div>
        </section>

        {/* Market Overview - bottom of page */}
        <section className="mt-8">
          <MarketOverview />
        </section>
      </div>

      </div>
    </div>
  );
}
