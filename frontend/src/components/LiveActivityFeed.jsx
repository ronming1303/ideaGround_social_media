import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  TrendingUp, TrendingDown, Zap, Users, DollarSign, 
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/activity/live`, { withCredentials: true });
      setActivities(response.data.activities || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, []);

  // Auto-refresh every 5 seconds for live feel
  useDataSync(fetchActivity, POLL_INTERVALS.FAST, !loading);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "just now";
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActionColor = (action) => {
    switch (action) {
      case "bought": return "text-emerald-500";
      case "sold": return "text-red-500";
      case "redeemed": return "text-orange-500";
      default: return "text-muted-foreground";
    }
  };

  const getActionBg = (action) => {
    switch (action) {
      case "bought": return "bg-emerald-500/10 border-emerald-500/20";
      case "sold": return "bg-red-500/10 border-red-500/20";
      case "redeemed": return "bg-orange-500/10 border-orange-500/20";
      default: return "bg-muted/50";
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden" data-testid="live-activity-feed">
      <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Live Activity
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </CardTitle>
        </div>
        
        {/* Platform Stats Banner */}
        {stats && (
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="font-mono font-medium text-foreground">{stats.total_volume_24h?.toLocaleString()}</span>
              <span>24h volume</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-mono font-medium text-foreground">{stats.active_traders}</span>
              <span>active</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[320px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs mt-1">Be the first to trade!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id || index}
                  className={`px-4 py-3 hover:bg-muted/30 transition-colors ${index === 0 ? 'bg-muted/20' : ''}`}
                  data-testid={`activity-item-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{activity.user_name}</span>
                        <span className={`text-sm font-semibold ${getActionColor(activity.action)}`}>
                          {activity.action}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                          {activity.shares}
                        </Badge>
                        <span className="text-sm text-muted-foreground">shares of</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-orange-500 font-semibold">
                          ${activity.ticker}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {activity.video_title}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-semibold">
                        ${activity.amount?.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.timestamp)}
                      </div>
                      {activity.price_after_trade && activity.price_at_trade && (
                        <div className={`text-[10px] flex items-center justify-end gap-0.5 ${
                          activity.price_after_trade > activity.price_at_trade 
                            ? 'text-emerald-500' 
                            : 'text-red-500'
                        }`}>
                          {activity.price_after_trade > activity.price_at_trade ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {((activity.price_after_trade - activity.price_at_trade) / activity.price_at_trade * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
