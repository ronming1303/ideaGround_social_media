import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Flame, Activity, RefreshCw, 
  ArrowUpRight, Eye, Zap
} from "lucide-react";
import { cn } from "../lib/utils";

export default function TrendingStocks({ onRefresh }) {
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gainers");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await axios.get(`${API}/trending`, { withCredentials: true });
      setTrending(response.data);
    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setLoading(false);
    }
  };

  const simulatePrices = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API}/simulate-prices`, {}, { withCredentials: true });
      await fetchTrending();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error simulating prices:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const StockItem = ({ video, showChange = true }) => {
    const changePercent = video.last_price_change_percent || 0;
    const isPositive = changePercent >= 0;

    return (
      <Link 
        to={`/video/${video.video_id}`}
        data-testid={`trending-${video.video_id}`}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
      >
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs px-1.5">
              {video.creator?.stock_symbol}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">
              {video.creator?.name}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{video.title}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold">${video.share_price?.toFixed(2)}</p>
          {showChange && (
            <p className={cn(
              "text-xs flex items-center justify-end gap-0.5",
              isPositive ? "text-secondary" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
            </p>
          )}
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse text-muted-foreground text-center">Loading trending...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Market Activity
          </CardTitle>
          <Button 
            data-testid="simulate-prices-btn"
            variant="outline" 
            size="sm"
            onClick={simulatePrices}
            disabled={refreshing}
            className="rounded-full"
          >
            <RefreshCw className={cn("w-4 h-4 mr-1", refreshing && "animate-spin")} />
            {refreshing ? "Updating..." : "Simulate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/50 mb-4">
            <TabsTrigger value="gainers" data-testid="tab-gainers" className="flex-1 rounded-full text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" data-testid="tab-losers" className="flex-1 rounded-full text-xs">
              <TrendingDown className="w-3 h-3 mr-1" />
              Losers
            </TabsTrigger>
            <TabsTrigger value="hot" data-testid="tab-hot" className="flex-1 rounded-full text-xs">
              <Flame className="w-3 h-3 mr-1" />
              Hot
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active" className="flex-1 rounded-full text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers" className="mt-0 space-y-1">
            {trending?.top_gainers?.length > 0 ? (
              trending.top_gainers.map((video) => (
                <StockItem key={video.video_id} video={video} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No gainers right now</p>
            )}
          </TabsContent>

          <TabsContent value="losers" className="mt-0 space-y-1">
            {trending?.top_losers?.length > 0 ? (
              trending.top_losers.map((video) => (
                <StockItem key={video.video_id} video={video} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No losers right now</p>
            )}
          </TabsContent>

          <TabsContent value="hot" className="mt-0 space-y-1">
            {trending?.hot_stocks?.map((video) => {
              const owned = 100 - (video.available_shares || 0);
              return (
                <Link 
                  key={video.video_id}
                  to={`/video/${video.video_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs px-1.5">
                        {video.creator?.stock_symbol}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{video.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">${video.share_price?.toFixed(2)}</p>
                    <p className="text-xs text-primary flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3" />
                      {owned.toFixed(0)}% owned
                    </p>
                  </div>
                </Link>
              );
            })}
          </TabsContent>

          <TabsContent value="active" className="mt-0 space-y-1">
            {trending?.most_active?.map((video) => (
              <Link 
                key={video.video_id}
                to={`/video/${video.video_id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs px-1.5">
                      {video.creator?.stock_symbol}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{video.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">${video.share_price?.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(video.views)} views
                  </p>
                </div>
              </Link>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
