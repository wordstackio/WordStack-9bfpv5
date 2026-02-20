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
    <div className="min-h-screen bg-background pb-20">
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

        {/* Premium Balance Card */}
        <div className="relative mb-6 perspective-1000">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            {/* Card Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            
            {/* Holographic Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-40" />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>
            
            {/* Card Content */}
            <div className="relative p-6 md:p-8 text-white">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300/90 to-yellow-500/90 shadow-lg flex items-center justify-center">
                    <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-80" />
                  </div>
                  <div className="text-xs font-medium tracking-wider opacity-90">CHIP</div>
                </div>
                
                <div className="text-right">
                  <div className="font-serif text-lg font-bold tracking-wider mb-0.5">WordStack</div>
                  <div className="text-xs opacity-75 tracking-wide">Ink Wallet</div>
                </div>
              </div>
              
              {/* Balance Display */}
              <div className="mb-8">
                <div className="text-xs font-medium tracking-wider opacity-75 mb-2">CURRENT BALANCE</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-5xl md:text-6xl font-bold tracking-tight">
                    {balance.toLocaleString()}
                  </div>
                  <div className="text-xl font-medium opacity-90">INK</div>
                </div>
              </div>
              
              {/* Card Footer - Stats */}
              <div className="flex items-end justify-between">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium tracking-wider opacity-75 mb-1">EARNED</div>
                    <div className="text-2xl font-bold">+{totalEarned.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="text-right space-y-3">
                  <div>
                    <div className="text-xs font-medium tracking-wider opacity-75 mb-1">GIVEN</div>
                    <div className="text-2xl font-bold">{totalGiven.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Card Number Style Detail */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-xs tracking-widest opacity-75">
                  <div>MEMBER SINCE {new Date(user.createdAt).getFullYear()}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <Wallet className="w-3 h-3" />
                    </div>
                    <span className="font-medium">PREMIUM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card Shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 -z-10 transform translate-y-2" />
        </div>

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
