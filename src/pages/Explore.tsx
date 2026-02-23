import PoetCard from "@/components/features/PoetCard";
import { mockPoets } from "@/lib/mockData";

export default function Explore() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Discover Poets
          </h1>
          <p className="text-lg text-muted-foreground">
            Find voices that resonate with you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {mockPoets.map(poet => (
            <PoetCard key={poet.id} poet={poet} />
          ))}
        </div>
      </div>
    </div>
  );
}
