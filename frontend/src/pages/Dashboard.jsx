import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Play, TrendingUp, TrendingDown, Clock, Eye, Heart, Sparkles, ArrowUpRight, Briefcase } from "lucide-react";
import TrendingTicker from "../components/TrendingTicker";
import TrendingStocks from "../components/TrendingStocks";

export default function Dashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [portfolioPerformance, setPortfolioPerformance] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPortfolioPerformance();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const [videosRes, creatorsRes] = await Promise.all([
        axios.get(`${API}/videos`, { withCredentials: true }),
        axios.get(`${API}/creators`, { withCredentials: true })
      ]);
      setVideos(videosRes.data);
      setCreators(creatorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioPerformance = async () => {
    try {
      const response = await axios.get(`${API}/portfolio/performance`, { withCredentials: true });
      setPortfolioPerformance(response.data);
    } catch (error) {
      // User might not be authenticated, that's okay
      console.log("Portfolio performance not available");
    }
  };

  const handlePriceRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  const filteredVideos = activeTab === "all" 
    ? videos 
    : videos.filter(v => v.video_type === activeTab);

  const VideoCard = ({ video, isLarge = false }) => (
    <Link 
      to={`/video/${video.video_id}`}
      data-testid={`video-card-${video.video_id}`}
      className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-hover transition-all duration-300 ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <div className={`relative ${isLarge ? 'aspect-video' : video.video_type === 'short' ? 'aspect-[9/16]' : 'aspect-video'}`}>
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Duration badge */}
        <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
          <Clock className="w-3 h-3 mr-1" />
          {video.duration_minutes}m
        </Badge>

        {/* Stock price badge with change indicator */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-sm font-mono font-medium flex items-center gap-1 ${
          (video.last_price_change_percent || 0) >= 0 ? 'bg-secondary text-white' : 'bg-destructive text-white'
        }`}>
          {(video.last_price_change_percent || 0) >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          ${video.share_price.toFixed(2)}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-primary fill-primary ml-1" />
          </div>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className={`font-heading font-semibold text-white mb-2 line-clamp-2 ${isLarge ? 'text-xl' : 'text-base'}`}>
            {video.title}
          </h3>
          <div className="flex items-center gap-3">
            {video.creator && (
              <div className="flex items-center gap-2">
                <img 
                  src={video.creator.image} 
                  alt={video.creator.name}
                  className="w-6 h-6 rounded-full object-cover border border-white/30"
                />
                <span className="text-sm text-white/80">{video.creator.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(video.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatViews(video.likes)}
              </span>
            </div>
          </div>
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
        <p className="text-sm text-muted-foreground">{creator.category}</p>
      </div>
      <div className="text-right">
        <p className="font-mono font-semibold text-secondary">{creator.stock_symbol}</p>
        <p className="text-xs text-muted-foreground">{formatViews(creator.subscriber_count)} subs</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading content...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Trending Ticker */}
      <TrendingTicker />
      
      {/* Portfolio Performance Banner */}
      {portfolioPerformance?.has_portfolio && (
        <div className="px-6 lg:px-8 max-w-7xl mx-auto mt-4">
          <Link to="/portfolio" data-testid="portfolio-performance-banner">
            <div className={`relative overflow-hidden rounded-2xl p-4 md:p-6 transition-all hover:scale-[1.01] ${
              portfolioPerformance.gain_percent >= 0 
                ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20' 
                : 'bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/5 border border-red-500/20'
            }`}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    portfolioPerformance.gain_percent >= 0 
                      ? 'bg-emerald-500/20' 
                      : 'bg-red-500/20'
                  }`}>
                    <Briefcase className={`w-6 h-6 ${
                      portfolioPerformance.gain_percent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Portfolio is</p>
                    <div className="flex items-center gap-2">
                      {portfolioPerformance.gain_percent >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`text-2xl md:text-3xl font-heading font-bold ${
                        portfolioPerformance.gain_percent >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {portfolioPerformance.gain_percent >= 0 ? '+' : ''}{portfolioPerformance.gain_percent.toFixed(1)}%
                      </span>
                      <span className={`text-lg font-medium ${
                        portfolioPerformance.gain_percent >= 0 ? 'text-emerald-600/70' : 'text-red-600/70'
                      }`}>
                        {portfolioPerformance.gain_percent >= 0 ? 'UP' : 'DOWN'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-lg font-heading font-bold">${portfolioPerformance.total_value.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Gain/Loss</p>
                    <p className={`text-lg font-heading font-bold ${
                      portfolioPerformance.total_gain >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {portfolioPerformance.total_gain >= 0 ? '+' : ''}${portfolioPerformance.total_gain.toFixed(2)}
                    </p>
                  </div>
                  {portfolioPerformance.total_potential_bonus > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Early Bonus</p>
                      <p className="text-lg font-heading font-bold text-amber-600">
                        +${portfolioPerformance.total_potential_bonus.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">View Details</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
      
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-muted-foreground">Discover trending content and grow your portfolio</p>
        </div>
        <Link to="/portfolio">
          <Button data-testid="view-portfolio-btn" className="bg-primary text-white hover:bg-primary/90 rounded-full gap-2">
            <TrendingUp className="w-4 h-4" />
            View Portfolio
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold">${user?.wallet_balance?.toFixed(2) || '500.00'}</p>
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold">{videos.length}</p>
            <p className="text-sm text-muted-foreground">Videos Available</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-chart-4/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-chart-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold">{creators.length}</p>
            <p className="text-sm text-muted-foreground">Creators</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-chart-5/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-chart-5" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold">{user?.subscriptions?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" data-testid="tab-all" className="rounded-full">All</TabsTrigger>
            <TabsTrigger value="short" data-testid="tab-shorts" className="rounded-full">Shorts</TabsTrigger>
            <TabsTrigger value="full" data-testid="tab-full" className="rounded-full">Full Videos</TabsTrigger>
          </TabsList>
          <Link to="/explore">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View all <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {/* Bento grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {filteredVideos.slice(0, 1).map((video, i) => (
              <div key={video.video_id} className="md:col-span-8">
                <VideoCard video={video} isLarge />
              </div>
            ))}
            <div className="md:col-span-4 space-y-6">
              {filteredVideos.slice(1, 3).map((video) => (
                <VideoCard key={video.video_id} video={video} />
              ))}
            </div>
            {filteredVideos.slice(3).map((video) => (
              <div key={video.video_id} className="md:col-span-4">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Trending creators */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold">Trending Creators</h2>
          <Link to="/explore">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View all <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((creator) => (
            <CreatorCard key={creator.creator_id} creator={creator} />
          ))}
        </div>
      </div>

      {/* Market Activity / Trending Stocks */}
      <div className="mt-8">
        <TrendingStocks onRefresh={handlePriceRefresh} />
      </div>
      </div>
    </div>
  );
}
