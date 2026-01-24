import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { 
  TrendingUp, TrendingDown, DollarSign, Briefcase, 
  ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, Minus, Award, Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";

export default function Portfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioHistory, setPortfolioHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sharesToSell, setSharesToSell] = useState(1);
  const [selling, setSelling] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    fetchPortfolioHistory();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/portfolio`, { withCredentials: true });
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioHistory = async () => {
    try {
      const response = await axios.get(`${API}/portfolio/history`, { withCredentials: true });
      setPortfolioHistory(response.data);
    } catch (error) {
      console.log("Portfolio history not available");
    }
  };

  const handleSellShares = async () => {
    if (!selectedItem || sharesToSell <= 0 || sharesToSell > selectedItem.shares_owned) {
      toast.error("Invalid share amount");
      return;
    }

    setSelling(true);
    try {
      const response = await axios.post(
        `${API}/shares/sell`,
        { video_id: selectedItem.video.video_id, shares: sharesToSell },
        { withCredentials: true }
      );
      
      // Show bonus info if applicable
      if (response.data.early_bonus_applied && response.data.bonus_earned > 0) {
        toast.success(
          `Sold ${sharesToSell} shares for ${formatCurrency(response.data.total_value)} (includes ${formatCurrency(response.data.bonus_earned)} early investor bonus!)`,
          { duration: 5000 }
        );
      } else {
        toast.success(`Successfully sold ${sharesToSell} shares for ${formatCurrency(response.data.total_value)}`);
      }
      
      setSellDialogOpen(false);
      setSelectedItem(null);
      fetchPortfolio(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to sell shares");
    } finally {
      setSelling(false);
    }
  };

  const openSellDialog = (item) => {
    setSelectedItem(item);
    setSharesToSell(1);
    setSellDialogOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const COLORS = ['hsl(24, 95%, 53%)', 'hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)', 'hsl(43, 74%, 66%)', 'hsl(27, 87%, 67%)'];

  // Custom tooltip for the chart
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-1">Portfolio</h1>
        <p className="text-muted-foreground">Track your video investments</p>
      </div>

      {/* Main stats */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-2 border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                <h2 className="font-heading text-4xl font-bold">{formatCurrency(totalPortfolioValue)}</h2>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${portfolio?.total_gain >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                {portfolio?.total_gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">{totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Mini chart */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory?.history || []}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="invested" 
                    stroke="hsl(24, 95%, 53%)" 
                    strokeWidth={2}
                    fill="url(#portfolioGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Invested Value</p>
            <p className="font-heading text-2xl font-bold">{formatCurrency(portfolio?.total_value || 0)}</p>
            <p className={`text-sm flex items-center gap-1 mt-1 ${portfolio?.total_gain >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {portfolio?.total_gain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {formatCurrency(Math.abs(portfolio?.total_gain || 0))} all time
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Cash Balance</p>
            <p className="font-heading text-2xl font-bold">{formatCurrency(portfolio?.wallet_balance || 0)}</p>
            <Link to="/wallet">
              <Button variant="link" className="p-0 h-auto text-sm text-primary">
                Add funds <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

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
                      <Link to={`/video/${item.video.video_id}`} className="flex-shrink-0 relative">
                        <img 
                          src={item.video.thumbnail} 
                          alt={item.video.title}
                          className="w-20 h-14 rounded-lg object-cover"
                        />
                        {item.is_early_investor && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center" title={`${item.early_bonus_multiplier}x Early Investor Bonus`}>
                            <Award className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={`/video/${item.video.video_id}`}>
                            <h4 className="font-medium truncate hover:text-primary transition-colors">{item.video.title}</h4>
                          </Link>
                          {item.is_early_investor && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30 flex-shrink-0">
                              {item.early_bonus_multiplier}x Bonus
                            </Badge>
                          )}
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
                        {item.potential_bonus > 0 && (
                          <p className="text-xs text-amber-600 flex items-center justify-end gap-1">
                            <Sparkles className="w-3 h-3" />
                            +{formatCurrency(item.potential_bonus)} bonus
                          </p>
                        )}
                      </div>
                      <Button 
                        data-testid={`sell-btn-${item.video.video_id}`}
                        variant="outline" 
                        size="sm"
                        onClick={() => openSellDialog(item)}
                        className="rounded-full"
                      >
                        Sell
                      </Button>
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
                          {portfolio.items.map((entry, index) => (
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

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Sell Shares</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <img 
                  src={selectedItem.video.thumbnail} 
                  alt={selectedItem.video.title}
                  className="w-20 h-14 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium line-clamp-1">{selectedItem.video.title}</p>
                  <p className="text-sm text-muted-foreground">${selectedItem.current_price.toFixed(2)} per share</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Shares to Sell</label>
                <div className="flex items-center gap-4">
                  <Slider
                    data-testid="sell-shares-slider"
                    value={[sharesToSell]}
                    onValueChange={(value) => setSharesToSell(value[0])}
                    max={selectedItem.shares_owned}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    data-testid="sell-shares-input"
                    type="number"
                    value={sharesToSell}
                    onChange={(e) => setSharesToSell(Math.min(Math.max(1, Number(e.target.value)), selectedItem.shares_owned))}
                    className="w-20 text-center font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">You own {selectedItem.shares_owned} shares</p>
              </div>

              <div className="p-4 rounded-xl bg-accent">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Price per share</span>
                  <span className="font-mono">${selectedItem.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-mono">x{sharesToSell}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Base value</span>
                  <span className="font-mono">{formatCurrency(selectedItem.current_price * sharesToSell)}</span>
                </div>
                {selectedItem.is_early_investor && selectedItem.gain > 0 && (
                  <div className="flex justify-between mb-2 text-amber-600">
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Early bonus ({selectedItem.early_bonus_multiplier}x on profit)
                    </span>
                    <span className="font-mono">
                      +{formatCurrency((sharesToSell / selectedItem.shares_owned) * selectedItem.potential_bonus)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-medium">You&apos;ll receive</span>
                  <span className="font-heading font-bold text-lg text-secondary">
                    +{formatCurrency(
                      selectedItem.current_price * sharesToSell + 
                      (selectedItem.is_early_investor && selectedItem.gain > 0 
                        ? (sharesToSell / selectedItem.shares_owned) * selectedItem.potential_bonus 
                        : 0)
                    )}
                  </span>
                </div>
              </div>

              {selectedItem.is_early_investor && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    You&apos;re an early investor! Profit bonus will be applied on sale.
                  </p>
                </div>
              )}

              <Button 
                data-testid="confirm-sell-btn"
                onClick={handleSellShares}
                disabled={selling}
                className="w-full bg-destructive text-white hover:bg-destructive/90 rounded-full py-6"
              >
                {selling ? "Processing..." : `Sell ${sharesToSell} Shares`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
