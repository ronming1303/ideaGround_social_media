import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  TrendingUp, TrendingDown, Flame, Star, Gem, Trophy, 
  Sparkles, Zap, RefreshCw, Activity, ChevronDown, ChevronUp, Eye
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
  "trending-up": { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  "trending-down": { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
  "flame": { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
  "star": { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  "gem": { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  "trophy": { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/30" },
  "sparkles": { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  "zap": { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/30" }
};

export default function MarketOverview({ onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState({});

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

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  // Expandable Panel Component
  const ExpandablePanel = ({ panelKey, category, categoryData }) => {
    const Icon = iconMap[categoryData.icon] || Activity;
    const colors = colorMap[categoryData.icon] || { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/30" };
    const isExpanded = expandedPanels[panelKey];
    const hasItems = categoryData.items?.length > 0;
    
    return (
      <div 
        data-testid={`market-panel-${panelKey}`}
        className={`rounded-xl border overflow-hidden transition-all duration-300 ${colors.border} ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
      >
        {/* Panel Header - Always visible, clickable */}
        <button
          onClick={() => togglePanel(panelKey)}
          className={`w-full p-4 flex items-center justify-between gap-3 transition-colors ${colors.bg} hover:brightness-95`}
          data-testid={`panel-toggle-${panelKey}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm">{categoryData.title}</h3>
              <p className="text-xs text-muted-foreground">{categoryData.qualifier}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick stat badge when collapsed */}
            {!isExpanded && hasItems && (
              <Badge variant="secondary" className="text-xs">
                {categoryData.items.length} {categoryData.items.length === 1 ? 'stock' : 'stocks'}
              </Badge>
            )}
            {/* Top item preview when collapsed */}
            {!isExpanded && hasItems && (
              <div className="hidden sm:flex items-center gap-2 text-right">
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {categoryData.items[0]?.title}
                </span>
                <span className={`font-mono text-sm font-bold ${colors.text}`}>
                  ${categoryData.items[0]?.share_price?.toFixed(2)}
                </span>
              </div>
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </button>
        
        {/* Expanded Content */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="border-t border-border/50 divide-y divide-border/50 bg-card">
            {hasItems ? (
              categoryData.items.map((item, idx) => (
                <Link 
                  key={item.video_id || idx}
                  to={`/video/${item.video_id}`}
                  data-testid={`market-item-${item.video_id}`}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Rank */}
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.bg} ${colors.text}`}>
                    {idx + 1}
                  </span>
                  
                  {/* Thumbnail */}
                  <img 
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">${item.ticker}</span>
                      <span>•</span>
                      <span>{item.creator_name}</span>
                    </div>
                  </div>
                  
                  {/* Price & Metric */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-base font-semibold">${item.share_price?.toFixed(2)}</p>
                    {/* Category-specific metric */}
                    {category === "top_gainers" && (
                      <p className="text-xs text-emerald-500 font-medium">+{item.price_change_percent?.toFixed(1)}%</p>
                    )}
                    {category === "top_losers" && (
                      <p className="text-xs text-red-500 font-medium">{item.price_change_percent?.toFixed(1)}%</p>
                    )}
                    {category === "hot_stocks" && (
                      <p className="text-xs text-orange-500 font-medium">{item.shares_sold_percent?.toFixed(0)}% sold</p>
                    )}
                    {category === "early_bonus" && (
                      <Badge className={`text-[10px] ${colors.bg} ${colors.text} border-0`}>
                        {item.early_bonus}x Bonus
                      </Badge>
                    )}
                    {category === "undervalued" && (
                      <p className="text-xs text-blue-500 font-medium flex items-center gap-1 justify-end">
                        <Eye className="w-3 h-3" />
                        {formatNumber(item.views)}
                      </p>
                    )}
                    {category === "best_roi" && (
                      <p className="text-xs text-yellow-600 font-medium">+{item.roi_percent?.toFixed(0)}% ROI</p>
                    )}
                    {category === "new_listings" && (
                      <Badge className="text-[10px] bg-purple-500/10 text-purple-500 border-0">New</Badge>
                    )}
                    {category === "most_traded" && (
                      <p className="text-xs text-cyan-500 font-medium">{item.txn_count_24h} trades/24h</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No stocks in this category yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-border/50" data-testid="market-overview-loading">
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
        <p className="text-sm text-muted-foreground mt-1">
          Click any panel to expand and see detailed stock information
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Section 1: Price Movement */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              📈 Price Movement
            </span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExpandablePanel 
              panelKey="top_gainers" 
              category="top_gainers" 
              categoryData={data.price_movement.top_gainers} 
            />
            <ExpandablePanel 
              panelKey="top_losers" 
              category="top_losers" 
              categoryData={data.price_movement.top_losers} 
            />
            <ExpandablePanel 
              panelKey="hot_stocks" 
              category="hot_stocks" 
              categoryData={data.price_movement.hot_stocks} 
            />
          </div>
        </div>

        {/* Section 2: Investment Opportunities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              💎 Investment Opportunities
            </span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <ExpandablePanel 
              panelKey="early_bonus" 
              category="early_bonus" 
              categoryData={data.opportunities.early_bonus} 
            />
            <ExpandablePanel 
              panelKey="undervalued" 
              category="undervalued" 
              categoryData={data.opportunities.undervalued} 
            />
            <ExpandablePanel 
              panelKey="best_roi" 
              category="best_roi" 
              categoryData={data.opportunities.best_roi} 
            />
            <ExpandablePanel 
              panelKey="new_listings" 
              category="new_listings" 
              categoryData={data.opportunities.new_listings} 
            />
            <ExpandablePanel 
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
