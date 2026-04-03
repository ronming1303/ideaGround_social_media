import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Users, Video, DollarSign, TrendingUp, Shield,
  Activity, CheckCircle, UserPlus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [users, setUsers] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorTicker, setCreatorTicker] = useState("");
  const [creatorAdding, setCreatorAdding] = useState(false);
  const [creatorList, setCreatorList] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, earningsRes, txnsRes, usersRes, cashflowRes, creatorsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/admin/earnings`, { withCredentials: true }),
        axios.get(`${API}/admin/transactions?limit=50`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
        axios.get(`${API}/admin/cashflow`, { withCredentials: true }),
        axios.get(`${API}/admin/creators`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setEarnings(earningsRes.data);
      setTransactions(txnsRes.data);
      setUsers(usersRes.data);
      setCashflow(cashflowRes.data);
      setCreatorList(creatorsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCreator = async () => {
    if (!creatorEmail.trim() || !creatorTicker.trim()) {
      toast.error("Please fill in both email and ticker");
      return;
    }
    setCreatorAdding(true);
    try {
      const res = await axios.post(`${API}/admin/creators`, {
        email: creatorEmail.trim(),
        stock_symbol: creatorTicker.trim(),
      }, { withCredentials: true });
      toast.success(`Creator @${res.data.creator.name} ($${res.data.creator.stock_symbol}) created!`);
      setCreatorEmail("");
      setCreatorTicker("");
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create creator");
    } finally {
      setCreatorAdding(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl">ideaGround Admin</h1>
              <p className="text-xs text-muted-foreground">Platform Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllData}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-heading font-bold">{stats?.users?.total || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.users?.creators || 0} creators • {stats?.users?.active || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                  <p className="text-2xl font-heading font-bold">{stats?.content?.total_videos || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Market Cap: {formatCurrency(stats?.content?.total_market_cap)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Earnings</p>
                  <p className="text-2xl font-heading font-bold text-emerald-600">
                    {formatCurrency(stats?.platform_revenue?.total_earnings)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.platform_revenue?.total_redemptions || 0} redemptions @ {stats?.platform_revenue?.fee_percent}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-heading font-bold">{stats?.transactions?.total_count || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Buy: {formatCurrency(stats?.transactions?.buy_volume)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Platform Earnings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cash Flow Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Cash Flow Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashflow?.daily_chart || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Bar dataKey="deposits" name="Deposits" fill="hsl(173, 58%, 39%)" />
                        <Bar dataKey="buys" name="Buys" fill="hsl(24, 95%, 53%)" />
                        <Bar dataKey="sells" name="Sells" fill="hsl(197, 37%, 50%)" />
                        <Bar dataKey="redemptions" name="Redemptions" fill="hsl(0, 84%, 60%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Deposits</p>
                      <p className="font-heading font-bold text-emerald-600">
                        {formatCurrency(cashflow?.summary?.total_deposits)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Redemptions</p>
                      <p className="font-heading font-bold text-red-500">
                        {formatCurrency(cashflow?.summary?.total_redemptions)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Earnings Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Platform Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earnings?.daily_chart || []}>
                        <defs>
                          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Area 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="hsl(173, 58%, 39%)" 
                          fill="url(#earningsGradient)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="font-heading font-bold text-emerald-600">
                        {formatCurrency(earnings?.summary?.total_earnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg per Transaction</p>
                      <p className="font-heading font-bold">
                        {formatCurrency(earnings?.summary?.avg_fee_per_transaction)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Platform Earnings Log</CardTitle>
                  <Badge variant="secondary">
                    Total: {formatCurrency(earnings?.summary?.total_earnings)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Video</th>
                        <th className="text-left py-3 px-4">Gross Amount</th>
                        <th className="text-left py-3 px-4">Fee %</th>
                        <th className="text-left py-3 px-4">Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings?.earnings?.map((item, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 text-muted-foreground">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="py-3 px-4">{item.user?.name}</td>
                          <td className="py-3 px-4 truncate max-w-[200px]">
                            {item.video?.title}
                          </td>
                          <td className="py-3 px-4">{formatCurrency(item.gross_amount)}</td>
                          <td className="py-3 px-4">{item.fee_percent}%</td>
                          <td className="py-3 px-4 font-medium text-emerald-600">
                            {formatCurrency(item.fee_amount)}
                          </td>
                        </tr>
                      ))}
                      {(!earnings?.earnings || earnings.earnings.length === 0) && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No earnings yet. Earnings are collected when users redeem shares.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction Audit Log</CardTitle>
                  <Badge variant="secondary">
                    {transactions?.count || 0} transactions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Video</th>
                        <th className="text-left py-3 px-4">Shares</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions?.transactions?.map((txn, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {formatDate(txn.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              txn.type === "buy_share" ? "default" :
                              txn.type === "sell_share" ? "secondary" :
                              txn.type === "redemption" ? "destructive" : "outline"
                            }>
                              {txn.type?.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{txn.user?.name}</td>
                          <td className="py-3 px-4 truncate max-w-[150px]">
                            {txn.video?.title || "N/A"}
                          </td>
                          <td className="py-3 px-4">{txn.shares || "-"}</td>
                          <td className={`py-3 px-4 font-medium ${
                            txn.amount >= 0 ? "text-emerald-600" : "text-red-500"
                          }`}>
                            {txn.amount >= 0 ? "+" : ""}{formatCurrency(txn.amount)}
                          </td>
                          <td className="py-3 px-4 text-amber-600">
                            {txn.platform_fee ? formatCurrency(txn.platform_fee) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Badge variant="secondary">
                    {users?.count || 0} users
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Wallet</th>
                        <th className="text-left py-3 px-4">Portfolio</th>
                        <th className="text-left py-3 px-4">Total Value</th>
                        <th className="text-left py-3 px-4">Txns</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.users?.map((user, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {user.picture && (
                                <img 
                                  src={user.picture} 
                                  alt="" 
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-3 px-4">{formatCurrency(user.wallet_balance)}</td>
                          <td className="py-3 px-4">{formatCurrency(user.portfolio_value)}</td>
                          <td className="py-3 px-4 font-medium">{formatCurrency(user.total_value)}</td>
                          <td className="py-3 px-4">{user.transaction_count}</td>
                          <td className="py-3 px-4">
                            {user.is_creator ? (
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                                Creator
                              </Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Creators Tab */}
          <TabsContent value="creators">
            <div className="grid md:grid-cols-2 gap-6 items-start">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Add Creator
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  The user must already have an account. Their name and avatar will be pulled from their profile.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">User Email</label>
                  <Input
                    placeholder="user@example.com"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ticker Symbol</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                    <Input
                      placeholder="RUMING"
                      value={creatorTicker}
                      onChange={(e) => setCreatorTicker(e.target.value.toUpperCase())}
                      className="pl-7 font-mono uppercase"
                      maxLength={8}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddCreator}
                  disabled={creatorAdding}
                  className="w-full rounded-full bg-primary text-white hover:bg-primary/90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {creatorAdding ? "Adding..." : "Add Creator"}
                </Button>
              </CardContent>
            </Card>

              {/* Registered Creators List */}
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Registered Creators
                    </CardTitle>
                    <Badge variant="secondary">{creatorList?.count || 0} total</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(!creatorList?.creators || creatorList.creators.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">No creators yet.</p>
                    )}
                    {creatorList?.creators?.map((c) => (
                      <div key={c.creator_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{c.email || <span className="text-muted-foreground italic">no email</span>}</p>
                          <p className="text-xs text-muted-foreground">{c.name}</p>
                        </div>
                        <Badge variant="outline" className="font-mono">${c.stock_symbol}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
