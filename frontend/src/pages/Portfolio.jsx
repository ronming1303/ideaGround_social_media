import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase,
  ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioHistory, setPortfolioHistory] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/portfolio`, { withCredentials: true });
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      if (loading) toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchPortfolioHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/portfolio/history`, { withCredentials: true });
      setPortfolioHistory(response.data);
    } catch (error) {
      console.log("Portfolio history not available");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
    fetchPortfolioHistory();
  }, []);

  // Auto-refresh polling
  // TODO: Replace with WebSocket for real-time updates
  useDataSync(
    useCallback(async () => {
      await Promise.all([fetchPortfolio(), fetchPortfolioHistory()]);
    }, [fetchPortfolio, fetchPortfolioHistory]),
    POLL_INTERVALS.FAST,
    !loading
  );


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const COLORS = ['hsl(24, 95%, 53%)', 'hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)', 'hsl(43, 74%, 66%)', 'hsl(27, 87%, 67%)'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  const totalPortfolioValue = (portfolio?.total_value || 0) + (portfolio?.wallet_balance || 0);
  const totalGainPercent = portfolio?.total_value > 0 
    ? (portfolio.total_gain / (portfolio.total_value - portfolio.total_gain) * 100) 
    : 0;

  return (
    <div className="page-enter p-6 lg:p-8 max-w-7xl mx-auto min-h-screen orange-gradient-subtle">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-1 gradient-text">Portfolio</h1>
        <p className="text-muted-foreground">Track your video investments</p>
      </div>

      {/* Main stats - compact design */}
      <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Card className="border-border/50 card-hover-orange">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-heading font-bold">{formatCurrency(totalPortfolioValue)}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold ${portfolio?.total_gain >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
              {portfolio?.total_gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-heading font-bold">{formatCurrency(portfolio?.total_value || 0)}</p>
              <p className="text-xs text-muted-foreground">Invested</p>
            </div>
            <div className={`flex items-center gap-1 text-sm ${portfolio?.total_gain >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {portfolio?.total_gain >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-semibold">{formatCurrency(Math.abs(portfolio?.total_gain || 0))}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-heading font-bold">{formatCurrency(portfolio?.wallet_balance || 0)}</p>
              <p className="text-xs text-muted-foreground">Cash Balance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Investment Chart */}
      {portfolioHistory?.history?.length > 1 && (
        <Card className="border-border/50 mb-6" data-testid="portfolio-chart">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Investment History
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your investment growth over time
                </p>
              </div>
              {portfolioHistory?.summary && (
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Value</p>
                    <p className="font-heading font-bold text-secondary">
                      {formatCurrency(portfolioHistory.summary.current_value)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory.history}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Current Value"
                    stroke="hsl(173, 58%, 39%)"
                    strokeWidth={2}
                    fill="url(#valueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio?.items?.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.items.map((item, index) => (
                    <div 
                      key={index}
                      data-testid={`holding-${item.video.video_id}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Link to={`/video/${item.video.video_id}`} className="flex-shrink-0">
                        <img
                          src={item.video.thumbnail}
                          alt={item.video.title}
                          className="w-20 h-14 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link to={`/video/${item.video.video_id}`} className="block min-w-0">
                            <h4 className="font-medium truncate hover:text-primary transition-colors">{item.video.title}</h4>
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.shares_owned} shares @ ${item.purchase_price.toFixed(2)} avg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold">{formatCurrency(item.current_value)}</p>
                        <p className={`text-sm flex items-center justify-end gap-1 ${item.gain >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                          {item.gain >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {item.gain >= 0 ? '+' : ''}{item.gain_percent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-heading font-semibold mb-2">No holdings yet</h3>
                  <p className="text-muted-foreground mb-4">Start investing in videos to build your portfolio</p>
                  <Link to="/dashboard">
                    <Button data-testid="browse-videos-btn" className="bg-primary text-white hover:bg-primary/90 rounded-full">
                      Browse Videos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Allocation chart */}
        <div>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio?.items?.length > 0 ? (
                <>
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolio.items}
                          dataKey="current_value"
                          nameKey="video.title"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {portfolio.items.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                  <p className="text-sm font-medium truncate max-w-[150px]">{payload[0].payload.video.title}</p>
                                  <p className="font-mono text-sm">{formatCurrency(payload[0].value)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {portfolio.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm truncate flex-1">{item.video.title}</span>
                        <span className="text-sm font-mono text-muted-foreground">
                          {((item.current_value / portfolio.total_value) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  No data to display
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}
