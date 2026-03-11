import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Eye, Heart, DollarSign, 
  Users, BarChart3, PieChart, Video, Sparkles, ArrowUpRight
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

export default function CreatorAnalytics() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [videoAnalytics, setVideoAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, videosRes] = await Promise.all([
        axios.get(`${API}/analytics/overview`, { withCredentials: true }),
        axios.get(`${API}/analytics/videos`, { withCredentials: true })
      ]);
      setOverview(overviewRes.data);
      setVideoAnalytics(videosRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse text-muted-foreground text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  if (!overview?.is_creator) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Creator Analytics</h2>
        <p className="text-muted-foreground mb-6">You need to be a creator to view analytics</p>
        <Link to="/studio">
          <Button className="bg-primary text-white hover:bg-primary/90 rounded-full">
            Go to Creator Studio
          </Button>
        </Link>
      </div>
    );
  }

  const analytics = overview.analytics;
  const videos = videoAnalytics?.videos || [];

  // Prepare data for charts
  const videoPerformanceData = videos.map(v => ({
    name: v.ticker_symbol || v.title.substring(0, 10),
    views: v.views,
    likes: v.likes,
    price: v.share_price
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/studio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </Link>
          <h1 className="font-heading text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <Badge variant="outline" className="font-mono text-lg px-3 py-1">
          {overview.creator?.stock_symbol}
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Total Views</span>
            </div>
            <p className="font-heading text-3xl font-bold">{formatNumber(analytics.total_views)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Total Likes</span>
            </div>
            <p className="font-heading text-3xl font-bold">{formatNumber(analytics.total_likes)}</p>
            <p className="text-xs text-secondary mt-1">{analytics.engagement_rate}% engagement</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Market Cap</span>
            </div>
            <p className="font-heading text-3xl font-bold">{formatCurrency(analytics.total_market_cap)}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg: {formatCurrency(analytics.avg_share_price)}/share</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Subscribers</span>
            </div>
            <p className="font-heading text-3xl font-bold">{formatNumber(analytics.subscriber_count)}</p>
            <p className="text-xs text-muted-foreground mt-1">{analytics.total_shares_sold} shares sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {analytics.top_video && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Top Video by Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                to={`/video/${analytics.top_video.video_id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <Badge variant="outline" className="font-mono text-xs mb-2">
                    {analytics.top_video.ticker_symbol}
                  </Badge>
                  <h4 className="font-medium">{analytics.top_video.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatNumber(analytics.top_video.views)} views
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        )}
        
        {analytics.best_performer && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Best Stock Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                to={`/video/${analytics.best_performer.video_id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <Badge variant="outline" className="font-mono text-xs mb-2">
                    {analytics.best_performer.ticker_symbol}
                  </Badge>
                  <h4 className="font-medium">{analytics.best_performer.title}</h4>
                  <p className="text-sm text-secondary font-mono mt-1">
                    {formatCurrency(analytics.best_performer.share_price)}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Video Performance Chart */}
      {videos.length > 0 && (
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="font-heading">Video Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoPerformanceData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-mono text-sm font-medium">{payload[0].payload.name}</p>
                            <p className="text-sm">Views: {formatNumber(payload[0].payload.views)}</p>
                            <p className="text-sm">Likes: {formatNumber(payload[0].payload.likes)}</p>
                            <p className="text-sm">Price: {formatCurrency(payload[0].payload.price)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="views" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Video Analytics */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-heading">Video Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videos.map((video) => (
              <div 
                key={video.video_id}
                data-testid={`analytics-video-${video.video_id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
              >
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-24 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {video.ticker_symbol || video.video_id}
                    </Badge>
                  </div>
                  <h4 className="font-medium truncate">{video.title}</h4>
                </div>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="font-mono font-semibold">{formatNumber(video.views)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Likes</p>
                    <p className="font-mono font-semibold">{formatNumber(video.likes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-mono font-semibold text-secondary">{formatCurrency(video.share_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Growth</p>
                    <p className={`font-mono font-semibold flex items-center justify-center ${video.price_growth_all_time >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {video.price_growth_all_time >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {video.price_growth_all_time >= 0 ? '+' : ''}{video.price_growth_all_time}%
                    </p>
                  </div>
                </div>
                <Link to={`/video/${video.video_id}`}>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
