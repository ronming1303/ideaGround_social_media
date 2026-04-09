import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  Wallet as WalletIcon, Plus, ArrowDownLeft,
  TrendingUp, ShoppingCart, DollarSign, History, CreditCard, Lock
} from "lucide-react";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, PaymentRequestButtonElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a1a1a",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
  disableLink: true,
};

function StripeCheckoutForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "IdeaGround Wallet Deposit", amount: Math.round(amount * 100) },
      requestPayerName: false,
      requestPayerEmail: false,
    });
    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });
    pr.on("paymentmethod", async (e) => {
      try {
        const { data } = await axios.post(
          `${API}/wallet/create-payment-intent`,
          { amount },
          { withCredentials: true }
        );
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          data.client_secret,
          { payment_method: e.paymentMethod.id },
          { handleActions: false }
        );
        if (error) {
          e.complete("fail");
          toast.error(error.message);
          return;
        }
        e.complete("success");
        const confirm = await axios.post(
          `${API}/wallet/confirm-payment`,
          { payment_intent_id: paymentIntent.id },
          { withCredentials: true }
        );
        onSuccess(confirm.data.new_balance, amount);
      } catch (err) {
        e.complete("fail");
        toast.error(err.response?.data?.detail || "Payment failed");
      }
    });
  }, [stripe, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { data } = await axios.post(
        `${API}/wallet/create-payment-intent`,
        { amount },
        { withCredentials: true }
      );
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      const confirm = await axios.post(
        `${API}/wallet/confirm-payment`,
        { payment_intent_id: result.paymentIntent.id },
        { withCredentials: true }
      );
      onSuccess(confirm.data.new_balance, amount);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {paymentRequest && (
        <div>
          <PaymentRequestButtonElement
            options={{ paymentRequest, style: { paymentRequestButton: { height: "48px", borderRadius: "24px" } } }}
          />
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or pay with card</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block">Card Details</label>
        <div className="border border-primary/20 rounded-xl p-4 focus-within:border-primary transition-colors bg-white">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Test card: 4242 4242 4242 4242 · Any future date · Any CVV
        </p>
      </div>

      <div className="p-4 rounded-xl bg-accent flex items-center justify-between">
        <span className="text-sm font-medium">Total</span>
        <span className="font-heading font-bold text-lg gradient-text">${amount.toFixed(2)}</span>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-full">
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full"
        >
          {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

export default function Wallet() {
  const { user, setUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [step, setStep] = useState("amount"); // "amount" | "payment"

  const fetchWallet = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/wallet`, { withCredentials: true });
      setWallet(response.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      if (loading) toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchWallet();
  }, []);

  useDataSync(
    fetchWallet,
    POLL_INTERVALS.NORMAL,
    !loading
  );

  const handleDialogClose = (open) => {
    setDepositDialogOpen(open);
    if (!open) {
      setDepositAmount("");
      setStep("amount");
    }
  };

  const handlePaymentSuccess = (newBalance, amount) => {
    toast.success(`Successfully deposited $${amount.toFixed(2)}`);
    setDepositDialogOpen(false);
    setDepositAmount("");
    setStep("amount");
    fetchWallet();
    if (user) setUser({ ...user, wallet_balance: newBalance });
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
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4" />;
      case 'creator_share_income':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'buy_share':
        return 'Bought Shares';
      case 'deposit':
        return 'Deposit';
      case 'creator_share_income':
        return 'Share Sale Income';
      default:
        return 'Transaction';
    }
  };

  const quickDeposits = [50, 100, 250, 500];
  const parsedAmount = parseFloat(depositAmount);
  const validAmount = !isNaN(parsedAmount) && parsedAmount >= 1;

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

            <Dialog open={depositDialogOpen} onOpenChange={handleDialogClose}>
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
                  <DialogTitle className="font-heading gradient-text flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {step === "amount" ? "Add Funds" : "Payment"}
                  </DialogTitle>
                </DialogHeader>

                {step === "amount" ? (
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
                          min="1"
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

                    <Button
                      data-testid="confirm-deposit-btn"
                      onClick={() => setStep("payment")}
                      disabled={!validAmount}
                      className="w-full bg-primary text-white hover:bg-primary/90 rounded-full py-6"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Elements stripe={stripePromise}>
                      <StripeCheckoutForm
                        amount={parsedAmount}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setStep("amount")}
                      />
                    </Elements>
                  </div>
                )}
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
                  className="p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      txn.amount >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {getTransactionIcon(txn.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="font-medium">{getTransactionLabel(txn.transaction_type)}</span>
                        <span className={`font-heading font-bold whitespace-nowrap ${txn.amount >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                          {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                        </span>
                      </div>
                      {txn.shares && (
                        <p className="text-sm text-muted-foreground">
                          ({txn.shares} shares)
                        </p>
                      )}
                      {txn.video && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{txn.video.title}</p>
                      )}
                      {txn.transaction_type === 'creator_share_income' && txn.buyer_name && (
                        <p className="text-sm text-muted-foreground">Bought by {txn.buyer_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(txn.created_at)}</p>
                    </div>
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
