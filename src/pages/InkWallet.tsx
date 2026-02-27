import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getUserInkBalance, getInkTransactions, InkTransaction } from "@/lib/storage";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Gift, ShoppingCart, Award, Heart } from "lucide-react";

export default function InkWallet() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<InkTransaction[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setBalance(getUserInkBalance(user.id));
    setTransactions(getInkTransactions(user.id));
  }, [user, navigate]);

  if (!user) return null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "given":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "purchased":
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      case "initial":
        return <Gift className="w-5 h-5 text-primary" />;
      default:
        return <Award className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
        return "text-green-600";
      case "given":
        return "text-red-600";
      case "purchased":
        return "text-blue-600";
      case "initial":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const totalEarned = transactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGiven = transactions
    .filter(t => t.type === "given")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Ink Wallet
          </h1>
          <p className="text-muted-foreground">
            Support poets and track your contributions
          </p>
        </div>

        {/* Compact Balance Card */}
        <Card className="relative mb-6 overflow-hidden bg-primary text-primary-foreground">
          {/* Subtle ink-drop decorative element */}
          <svg
            className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10"
            viewBox="0 0 100 100"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M50 5C50 5 20 45 20 65C20 82 33.5 95 50 95C66.5 95 80 82 80 65C80 45 50 5 50 5Z" />
          </svg>

          <div className="relative flex items-center gap-4 p-4">
            {/* Ink drop icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C12 2 5 11.5 5 16C5 19.87 8.13 23 12 23C15.87 23 19 19.87 19 16C19 11.5 12 2 12 2Z" />
              </svg>
            </div>

            {/* Balance info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium tracking-wide opacity-80">Balance</p>
              <p className="text-2xl font-bold leading-tight">{balance.toLocaleString()} <span className="text-sm font-medium opacity-80">INK</span></p>
            </div>

            {/* Earned / Given mini stats */}
            <div className="flex-shrink-0 flex gap-4 text-right">
              <div>
                <p className="text-[10px] font-medium tracking-wide uppercase opacity-70">Earned</p>
                <p className="text-sm font-bold leading-tight">+{totalEarned.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wide uppercase opacity-70">Given</p>
                <p className="text-sm font-bold leading-tight">{totalGiven.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button size="lg" className="w-full" onClick={() => navigate("/ink-store")}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy More Ink
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => navigate("/explore")}>
            <Heart className="w-4 h-4 mr-2" />
            Support Poets
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-4 mb-6 bg-accent/20">
          <div className="flex gap-3">
            <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">What is Ink?</p>
              <p className="text-muted-foreground leading-relaxed">
                Ink is WordStack's way of supporting poets. Give Ink to poems you love, and poets earn from your appreciation. All new users start with 100 free Ink!
              </p>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-bold mb-4">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start supporting poets to see your transaction history here.
            </p>
            <Button onClick={() => navigate("/explore")}>
              <Heart className="w-4 h-4 mr-2" />
              Explore Poets
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1 leading-tight">
                      {transaction.description}
                    </p>
                    
                    {transaction.recipientName && (
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === "given" ? "To" : "From"}: {transaction.recipientName}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
