import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, BarChart3, 
  PieChart, Activity, Briefcase, Sparkles, ArrowUpRight,
  Target, Zap, Building2, ChevronRight, RefreshCw
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, CartesianGrid, Legend
} from "recharts";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";

export default function InvestorDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/platform/investor-metrics`, { withCredentials: true });
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every 30 seconds
  const { refresh } = useDataSync(fetchMetrics, POLL_INTERVALS.SLOW, !loading);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  // Revenue split colors
  const COLORS = ['#f97316', '#14b8a6', '#64748b'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center orange-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          <span className="text-muted-foreground">Loading investor metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{error || "No data available"}</p>
          <Button onClick={fetchMetrics}>Retry</Button>
        </Card>
      </div>
    );
  }

  const revenueData = [
    { name: 'Creator', value: metrics.revenue_model.creator_share, color: '#f97316' },
    { name: 'Investors', value: metrics.revenue_model.investor_share, color: '#14b8a6' },
    { name: 'Platform', value: metrics.revenue_model.platform_share, color: '#64748b' }
  ];

  return (
    <div className="page-enter orange-gradient-subtle min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold">Platform Metrics</h1>
                <p className="text-muted-foreground">Investor Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Data
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-orange-500" />
                <Badge className="bg-orange-500/20 text-orange-600 border-0">Revenue</Badge>
              </div>
              <p className="font-heading text-3xl font-bold">{formatCurrency(metrics.revenue.total_platform_revenue)}</p>
              <p className="text-sm text-muted-foreground">Platform Revenue ({metrics.revenue.fee_percent}% fee)</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-emerald-500" />
                <Badge className="bg-emerald-500/20 text-emerald-600 border-0">Volume</Badge>
              </div>
              <p className="font-heading text-3xl font-bold">{formatCurrency(metrics.trading.total_buy_volume)}</p>
              <p className="text-sm text-muted-foreground">Total Trading Volume</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-500" />
                <Badge className="bg-blue-500/20 text-blue-600 border-0">Users</Badge>
              </div>
              <p className="font-heading text-3xl font-bold">{metrics.overview.total_users}</p>
              <p className="text-sm text-muted-foreground">{metrics.overview.unique_investors} Active Investors</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 text-purple-500" />
                <Badge className="bg-purple-500/20 text-purple-600 border-0">Market</Badge>
              </div>
              <p className="font-heading text-3xl font-bold">{formatCurrency(metrics.overview.total_market_cap)}</p>
              <p className="text-sm text-muted-foreground">Total Market Cap</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Model */}
          <Card className="border-border/50" data-testid="revenue-model-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                Revenue Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                              <p className="font-medium">{payload[0].name}</p>
                              <p className="font-mono text-lg">{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {revenueData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                Platform earns {metrics.revenue.fee_percent}% fee on all redemptions
              </div>
            </CardContent>
          </Card>

          {/* Trading Activity Chart */}
          <Card className="border-border/50 lg:col-span-2" data-testid="trading-chart">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                7-Day Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.charts.daily_volumes}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="text-sm text-muted-foreground mb-1">{label}</p>
                              <p className="font-mono font-bold text-lg">${payload[0].value.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{payload[0].payload.transactions} transactions</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      fill="url(#volumeGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Stats & Top Performers */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Trading Statistics */}
          <Card className="border-border/50" data-testid="trading-stats">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Trading Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                  <p className="font-mono text-xl font-bold text-emerald-600">{formatCurrency(metrics.trading.volume_24h)}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-1">7d Volume</p>
                  <p className="font-mono text-xl font-bold text-blue-600">{formatCurrency(metrics.trading.volume_7d)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
                  <p className="font-mono text-xl font-bold">{metrics.trading.total_transactions}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Avg Transaction</p>
                  <p className="font-mono text-xl font-bold">{formatCurrency(metrics.trading.avg_transaction_size)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Active Traders (24h)</p>
                  <p className="font-mono text-xl font-bold">{metrics.trading.active_traders_24h}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Active Traders (7d)</p>
                  <p className="font-mono text-xl font-bold">{metrics.trading.active_traders_7d}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Ownership */}
          <Card className="border-border/50" data-testid="share-ownership">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Share Ownership
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Ownership Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Platform Ownership Rate</span>
                  <span className="font-mono font-bold text-orange-600">{metrics.shares.ownership_rate}%</span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                    style={{ width: `${metrics.shares.ownership_rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatNumber(metrics.shares.total_shares_sold)} sold</span>
                  <span>{formatNumber(metrics.shares.total_shares_available)} available</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Total Shares Held</p>
                  <p className="font-mono text-xl font-bold">{formatNumber(metrics.shares.total_shares_held)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Avg Share Price</p>
                  <p className="font-mono text-xl font-bold">${metrics.shares.avg_share_price.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Unique Investors</p>
                  <p className="font-mono text-xl font-bold text-purple-600">{metrics.overview.unique_investors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Projections & Top Performers */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <Card className="border-border/50" data-testid="revenue-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">24h Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-emerald-600">{formatCurrency(metrics.revenue.revenue_24h)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">7d Revenue</span>
                  </div>
                  <p className="font-mono text-2xl font-bold">{formatCurrency(metrics.revenue.revenue_7d)}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Projected Monthly</span>
                    <Sparkles className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-orange-600">{formatCurrency(metrics.revenue.projected_monthly)}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Projected Annual</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-purple-600">{formatCurrency(metrics.revenue.projected_annual)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Videos */}
          <Card className="border-border/50" data-testid="top-videos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Top Performing Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.top_videos.map((video, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono text-orange-500">${video.ticker}</span>
                        <span>•</span>
                        <span>{video.ownership_pct}% owned</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">${video.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(video.market_cap)} cap</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Traders */}
          <Card className="border-border/50" data-testid="top-traders">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Top Traders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.top_traders.map((trader, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      i === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                      i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                      i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800' :
                      'bg-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{trader.name}</p>
                    </div>
                    <p className="font-mono font-semibold text-emerald-600">{formatCurrency(trader.volume)}</p>
                  </div>
                ))}
                {metrics.top_traders.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No trading activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data refreshes automatically • Last updated: {new Date(metrics.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
