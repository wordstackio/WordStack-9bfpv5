import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Clock, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OutOfInkModalProps {
  onClose: () => void;
  dailyUsed: number;
  monthlyUsed: number;
  timeUntilReset: string;
}

export default function OutOfInkModal({ 
  onClose, 
  dailyUsed, 
  monthlyUsed, 
  timeUntilReset 
}: OutOfInkModalProps) {
  const navigate = useNavigate();

  const handleBuyInk = () => {
    onClose();
    navigate("/ink-store");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-background p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👏</span>
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">
            Oops! You're out of free Ink.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You get <strong>5 free Ink every day</strong>, up to <strong>25 per month</strong>. Come back tomorrow, or buy more Ink to keep clapping and tipping!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 p-4 bg-accent/30 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Free Ink this month:</span>
            <span className="font-semibold">{monthlyUsed} / 25 used</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(monthlyUsed / 25) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Next free Ink in {timeUntilReset}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleBuyInk}
            size="lg" 
            className="w-full"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy More Ink
          </Button>
          <Button 
            onClick={onClose}
            size="lg" 
            variant="outline" 
            className="w-full"
          >
            I'll Wait for Free Ink
          </Button>
        </div>

        {/* Optional: Small hint for first-time buyers */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          💡 First purchase? Get a bonus with our starter pack!
        </p>
      </Card>
    </div>
  );
}
