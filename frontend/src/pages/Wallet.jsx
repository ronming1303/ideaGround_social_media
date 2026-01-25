import { useState, useEffect } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, 
  TrendingUp, ShoppingCart, DollarSign, History
} from "lucide-react";

export default function Wallet() {
  const { user, setUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API}/wallet`, { withCredentials: true });
      setWallet(response.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setDepositing(true);
    try {
      const response = await axios.post(
        `${API}/wallet/deposit`,
        { amount },
        { withCredentials: true }
      );
      toast.success(`Successfully deposited $${amount.toFixed(2)}`);
      setDepositDialogOpen(false);
      setDepositAmount("");
      fetchWallet();
      // Update user context
      if (user) {
        setUser({ ...user, wallet_balance: response.data.new_balance });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to deposit");
    } finally {
      setDepositing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'buy_share':
        return <ShoppingCart className="w-4 h-4" />;
      case 'sell_share':
        return <TrendingUp className="w-4 h-4" />;
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'buy_share':
        return 'Bought Shares';
      case 'sell_share':
        return 'Sold Shares';
      case 'deposit':
        return 'Deposit';
      default:
        return 'Transaction';
    }
  };

  const quickDeposits = [50, 100, 250, 500];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center orange-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-muted-foreground">Loading wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter p-6 lg:p-8 max-w-4xl mx-auto min-h-screen orange-gradient-subtle">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-1 gradient-text">Wallet</h1>
        <p className="text-muted-foreground">Manage your funds</p>
      </div>

      {/* Balance card */}
      <Card className="border-border/50 mb-8 overflow-hidden card-hover-orange">
        <div className="bg-gradient-to-br from-orange-500/10 via-orange-100/30 to-orange-600/5 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center orange-glow">
                  <WalletIcon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Available Balance</span>
              </div>
              <h2 className="font-heading text-5xl font-bold gradient-text">{formatCurrency(wallet?.balance || 0)}</h2>
            </div>

            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="add-funds-btn"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-8 py-6 text-lg shadow-lg orange-glow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading gradient-text">Add Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        data-testid="deposit-amount-input"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-10 h-14 text-xl font-mono border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Quick Select</label>
                    <div className="grid grid-cols-4 gap-2">
                      {quickDeposits.map((amount) => (
                        <Button
                          key={amount}
                          data-testid={`quick-deposit-${amount}`}
                          variant="outline"
                          onClick={() => setDepositAmount(amount.toString())}
                          className="rounded-xl"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-accent">
                    <p className="text-sm text-muted-foreground text-center">
                      This is a simulated deposit for demo purposes. No real money is involved.
                    </p>
                  </div>

                  <Button 
                    data-testid="confirm-deposit-btn"
                    onClick={handleDeposit}
                    disabled={depositing || !depositAmount}
                    className="w-full bg-primary text-white hover:bg-primary/90 rounded-full py-6"
                  >
                    {depositing ? "Processing..." : `Deposit ${depositAmount ? formatCurrency(parseFloat(depositAmount)) : '$0.00'}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Transaction history */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallet?.transactions?.length > 0 ? (
            <div className="space-y-3">
              {wallet.transactions.map((txn, index) => (
                <div 
                  key={index}
                  data-testid={`transaction-${txn.transaction_id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.amount >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {getTransactionIcon(txn.transaction_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getTransactionLabel(txn.transaction_type)}</span>
                      {txn.shares && (
                        <span className="text-sm text-muted-foreground">
                          ({txn.shares} shares)
                        </span>
                      )}
                    </div>
                    {txn.video && (
                      <p className="text-sm text-muted-foreground truncate">{txn.video.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(txn.created_at)}</p>
                  </div>
                  <div className={`font-heading font-bold ${txn.amount >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                    {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-heading font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">Your transaction history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
