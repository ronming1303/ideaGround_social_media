import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  TrendingUp, TrendingDown, Flame, Star, Gem, Trophy, 
  Sparkles, Zap, RefreshCw, Activity, ChevronDown, ChevronUp, 
  Eye, Maximize2, Minimize2
} from "lucide-react";
import { cn } from "../lib/utils";

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
  "trending-up": "text-emerald-500",
  "trending-down": "text-red-500",
  "flame": "text-orange-500",
  "star": "text-amber-500",
  "gem": "text-blue-500",
  "trophy": "text-yellow-600",
  "sparkles": "text-purple-500",
  "zap": "text-cyan-500"
};

export default function MarketOverview({ onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);

  const allPanelKeys = [
    "top_gainers", "top_losers", "hot_stocks",
    "early_bonus", "undervalued", "best_roi", "new_listings", "most_traded"
  ];

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

  const togglePanel = (key) => {
    setExpandedPanels(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    const newPanels = {};
    allPanelKeys.forEach(key => {
      newPanels[key] = newState;
    });
    setExpandedPanels(newPanels);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  // Simple stock item - similar to earlier design
  const StockItem = ({ item, category }) => {
    const changePercent = item.price_change_percent || 0;
    const isPositive = changePercent >= 0;

    return (
      <Link 
        to={`/video/${item.video_id}`}
        data-testid={`market-item-${item.video_id}`}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
      >
        <img 
          src={item.thumbnail} 
          alt={item.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs px-1.5">
              ${item.ticker}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">
              {item.creator_name}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{item.title}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold">${item.share_price?.toFixed(2)}</p>
          {/* Category-specific metric */}
          {(category === "top_gainers" || category === "top_losers") && (
            <p className={cn(
              "text-xs flex items-center justify-end gap-0.5",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
            </p>
          )}
          {category === "hot_stocks" && (
            <p className="text-xs text-orange-500 flex items-center justify-end gap-1">
              <Flame className="w-3 h-3" />
              {item.shares_sold_percent?.toFixed(0)}% sold
            </p>
          )}
          {category === "early_bonus" && (
            <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0">
              {item.early_bonus}x bonus
            </Badge>
          )}
          {category === "undervalued" && (
            <p className="text-xs text-blue-500 flex items-center justify-end gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(item.views)}
            </p>
          )}
          {category === "best_roi" && (
            <p className="text-xs text-yellow-600 flex items-center justify-end gap-1">
              <Trophy className="w-3 h-3" />
              +{item.roi_percent?.toFixed(0)}%
            </p>
          )}
          {category === "new_listings" && (
            <Badge className="text-[10px] bg-purple-500/10 text-purple-500 border-0">
              New
            </Badge>
          )}
          {category === "most_traded" && (
            <p className="text-xs text-cyan-500 flex items-center justify-end gap-1">
              <Zap className="w-3 h-3" />
              {item.txn_count_24h} trades
            </p>
          )}
        </div>
      </Link>
    );
  };

  // Simple collapsible category section
  const CategorySection = ({ panelKey, category, categoryData }) => {
    const Icon = iconMap[categoryData.icon] || Activity;
    const color = colorMap[categoryData.icon] || "text-gray-500";
    const isExpanded = expandedPanels[panelKey];
    const hasItems = categoryData.items?.length > 0;
    
    return (
      <div 
        data-testid={`market-panel-${panelKey}`}
        className="border border-border/50 rounded-xl overflow-hidden bg-card"
      >
        {/* Header */}
        <button
          onClick={() => togglePanel(panelKey)}
          data-testid={`panel-toggle-${panelKey}`}
          className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", color)} />
            <span className="font-medium text-sm">{categoryData.title}</span>
            <span className="text-xs text-muted-foreground">({categoryData.items?.length || 0})</span>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )} />
        </button>
        
        {/* Content */}
        {isExpanded && (
          <div className="border-t border-border/50">
            {hasItems ? (
              <div className="divide-y divide-border/30">
                {categoryData.items.map((item, idx) => (
                  <StockItem key={item.video_id || idx} item={item} category={category} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No stocks in this category</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-border/50" data-testid="market-overview-loading">
        <CardContent className="p-6">
          <div className="animate-pulse text-muted-foreground text-center">Loading market data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-border/50" data-testid="market-overview">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Market Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              data-testid="toggle-all-panels-btn"
              variant="ghost" 
              size="sm"
              onClick={toggleAll}
              className="text-xs"
            >
              {allExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 mr-1" />
                  Collapse All
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 mr-1" />
                  Expand All
                </>
              )}
            </Button>
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
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Section 1: Price Movement */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Price Movement
            </span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <CategorySection 
              panelKey="top_gainers" 
              category="top_gainers" 
              categoryData={data.price_movement.top_gainers} 
            />
            <CategorySection 
              panelKey="top_losers" 
              category="top_losers" 
              categoryData={data.price_movement.top_losers} 
            />
            <CategorySection 
              panelKey="hot_stocks" 
              category="hot_stocks" 
              categoryData={data.price_movement.hot_stocks} 
            />
          </div>
        </div>

        {/* Section 2: Investment Opportunities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gem className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Investment Opportunities
            </span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <CategorySection 
              panelKey="early_bonus" 
              category="early_bonus" 
              categoryData={data.opportunities.early_bonus} 
            />
            <CategorySection 
              panelKey="undervalued" 
              category="undervalued" 
              categoryData={data.opportunities.undervalued} 
            />
            <CategorySection 
              panelKey="best_roi" 
              category="best_roi" 
              categoryData={data.opportunities.best_roi} 
            />
            <CategorySection 
              panelKey="new_listings" 
              category="new_listings" 
              categoryData={data.opportunities.new_listings} 
            />
            <CategorySection 
              panelKey="most_traded" 
              category="most_traded" 
              categoryData={data.opportunities.most_traded} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
