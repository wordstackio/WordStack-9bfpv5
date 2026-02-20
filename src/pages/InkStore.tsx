import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, ShoppingCart, Sparkles, Lock } from "lucide-react";
import poetsSpark from "@/assets/ink-packages/poets-spark.png";
import verseBuilder from "@/assets/ink-packages/verse-builder.png";
import risingPoet from "@/assets/ink-packages/rising-poet.png";
import epicFlow from "@/assets/ink-packages/epic-flow.png";
import legendaryQuill from "@/assets/ink-packages/legendary-quill.png";

interface InkPackage {
  id: string;
  name: string;
  inkAmount: number;
  bonusInk?: number;
  price: number;
  image: string;
  description: string;
  popular?: boolean;
}

const inkPackages: InkPackage[] = [
  {
    id: "poets-spark",
    name: "Poet's Spark",
    inkAmount: 50,
    price: 0.99,
    image: poetsSpark,
    description: "Get your first spark of inspiration!"
  },
  {
    id: "verse-builder",
    name: "Verse Builder",
    inkAmount: 200,
    price: 3.99,
    image: verseBuilder,
    description: "Fuel your next 20 claps and tips!"
  },
  {
    id: "rising-poet",
    name: "Rising Poet",
    inkAmount: 500,
    price: 8.99,
    image: risingPoet,
    description: "Boost your poems, shine brighter!"
  },
  {
    id: "epic-flow",
    name: "Epic Flow",
    inkAmount: 1200,
    price: 19.99,
    image: epicFlow,
    description: "Make your poems go epic—feature, boost, tip!"
  },
  {
    id: "legendary-quill",
    name: "Legendary Quill",
    inkAmount: 3000,
    bonusInk: 500,
    price: 49.99,
    image: legendaryQuill,
    description: "For Poets Ready to Dominate the Feed!",
    popular: true
  }
];

export default function InkStore() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  const handlePurchase = (pkg: InkPackage) => {
    setSelectedPackage(pkg.id);
    // Payment integration will be added here later
    alert(`Payment for ${pkg.name} will be integrated soon!\nAmount: $${pkg.price.toFixed(2)}`);
    setTimeout(() => setSelectedPackage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3">
              Ink Store
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your perfect Ink package and start supporting the poets you love
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="p-4 mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">How Ink Works</p>
              <p className="text-muted-foreground leading-relaxed">
                Purchase Ink to support poets whose work moves you. Every Ink you give helps creators continue their craft. Larger packages include bonus Ink for even more impact!
              </p>
            </div>
          </div>
        </Card>

        {/* Desktop: Single Row Scrollable / Grid Hybrid */}
        {/* Mobile: Stacked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {inkPackages.map((pkg) => (
            <div key={pkg.id} className="relative">
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <Card 
                onClick={() => handlePurchase(pkg)}
                className={`cursor-pointer transition-all duration-300 overflow-hidden h-full ${
                  pkg.popular 
                    ? "ring-2 ring-amber-500 shadow-xl hover:shadow-2xl hover:scale-105" 
                    : "hover:shadow-xl hover:scale-105"
                } ${selectedPackage === pkg.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="relative">
                  <img 
                    src={pkg.image} 
                    alt={pkg.name}
                    className="w-full h-auto object-contain"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <Button 
                      size="lg" 
                      className="font-bold shadow-xl"
                      disabled={selectedPackage === pkg.id}
                    >
                      {selectedPackage === pkg.id ? (
                        <>
                          <Lock className="w-4 h-4 mr-2 animate-pulse" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now ${pkg.price.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <p className="font-semibold">Secure Payment</p>
                <p className="text-muted-foreground">All transactions are encrypted and secure</p>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What is Ink?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ink is WordStack's currency that allows you to support poets directly. When you give Ink to a poem, the poet receives it as appreciation for their work.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do larger packages offer better value?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes! Our Legendary Quill package includes 500 bonus Ink (16% extra) compared to buying the base amount. The more you invest in supporting poets, the more Ink you get.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">How do I use my Ink?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                After purchasing, your Ink balance will update immediately. Simply tap the heart icon on any poem to give Ink and show your support to the poet.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I earn Ink as a poet?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Absolutely! When readers give Ink to your poems, you earn that Ink. You can use it to support other poets or track it as a measure of your work's impact.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
