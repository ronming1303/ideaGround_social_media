import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  TrendingUp, TrendingDown, Flame, Star, Gem, Trophy, 
  Sparkles, Zap, RefreshCw, Activity, ChevronRight, Eye
} from "lucide-react";

const iconMap = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "flame": Flame,
  "star": Star,
  "gem": Gem,
  "trophy": Trophy,
  "sparkles": Sparkles,
  "zap": Zap
};

const colorMap = {
  "trending-up": "text-emerald-500 bg-emerald-500/10",
  "trending-down": "text-red-500 bg-red-500/10",
  "flame": "text-orange-500 bg-orange-500/10",
  "star": "text-amber-500 bg-amber-500/10",
  "gem": "text-blue-500 bg-blue-500/10",
  "trophy": "text-yellow-500 bg-yellow-500/10",
  "sparkles": "text-purple-500 bg-purple-500/10",
  "zap": "text-cyan-500 bg-cyan-500/10"
};

export default function MarketOverview({ onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/market-overview`, { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching market overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const simulatePrices = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API}/simulate-prices`, {}, { withCredentials: true });
      await fetchData();
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
    return num?.toString() || "0";
  };

  // Mini card component for each category
  const CategoryCard = ({ category, data }) => {
    const Icon = iconMap[data.icon] || Activity;
    const colors = colorMap[data.icon] || "text-gray-500 bg-gray-500/10";
    
    return (
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">{data.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{data.qualifier}</p>
        </div>
        
        {/* Items */}
        <div className="divide-y divide-border/50">
          {data.items?.length > 0 ? (
            data.items.map((item, idx) => (
              <Link 
                key={item.video_id || idx}
                to={`/video/${item.video_id}`}
                className="flex items-center gap-2 p-2.5 hover:bg-muted/50 transition-colors"
              >
                <img 
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">${item.ticker}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm font-semibold">${item.share_price?.toFixed(2)}</p>
                  {/* Show relevant metric based on category */}
                  {category === "top_gainers" && (
                    <p className="text-[10px] text-emerald-500 font-medium">+{item.price_change_percent?.toFixed(1)}%</p>
                  )}
                  {category === "top_losers" && (
                    <p className="text-[10px] text-red-500 font-medium">{item.price_change_percent?.toFixed(1)}%</p>
                  )}
                  {category === "hot_stocks" && (
                    <p className="text-[10px] text-orange-500 font-medium">{item.shares_sold_percent?.toFixed(0)}% sold</p>
                  )}
                  {category === "early_bonus" && (
                    <p className="text-[10px] text-amber-500 font-bold">{item.early_bonus}x</p>
                  )}
                  {category === "undervalued" && (
                    <p className="text-[10px] text-blue-500 font-medium">{formatNumber(item.views)} views</p>
                  )}
                  {category === "best_roi" && (
                    <p className="text-[10px] text-yellow-600 font-medium">+{item.roi_percent?.toFixed(0)}%</p>
                  )}
                  {category === "new_listings" && (
                    <p className="text-[10px] text-purple-500 font-medium">New</p>
                  )}
                  {category === "most_traded" && (
                    <p className="text-[10px] text-cyan-500 font-medium">{item.txn_count_24h} trades</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading market data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-border/50" data-testid="market-overview">
      <CardHeader className="pb-4">
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
            className="rounded-full text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Updating..." : "Simulate Prices"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Section 1: Price Movement */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Movement</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryCard category="top_gainers" data={data.price_movement.top_gainers} />
            <CategoryCard category="top_losers" data={data.price_movement.top_losers} />
            <CategoryCard category="hot_stocks" data={data.price_movement.hot_stocks} />
          </div>
        </div>

        {/* Section 2: Investment Opportunities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Investment Opportunities</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <CategoryCard category="early_bonus" data={data.opportunities.early_bonus} />
            <CategoryCard category="undervalued" data={data.opportunities.undervalued} />
            <CategoryCard category="best_roi" data={data.opportunities.best_roi} />
            <CategoryCard category="new_listings" data={data.opportunities.new_listings} />
            <CategoryCard category="most_traded" data={data.opportunities.most_traded} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
