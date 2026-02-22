import { X, User } from "lucide-react";
import { useEffect } from "react";

interface Clapper {
  id: string;
  name: string;
  avatar: string;
}

interface ClappersModalProps {
  onClose: () => void;
  clappers: Clapper[];
  totalClaps: number;
}

export default function ClappersModal({
  onClose,
  clappers,
  totalClaps,
}: ClappersModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-background border border-border rounded-xl shadow-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Applause
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalClaps} {totalClaps === 1 ? "clap" : "claps"} from{" "}
              {clappers.length} {clappers.length === 1 ? "person" : "people"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Clappers List */}
        <div className="overflow-y-auto flex-1 px-5 py-3">
          {clappers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No claps yet. Be the first!
            </p>
          ) : (
            <div className="space-y-1">
              {clappers.map((clapper) => (
                <div
                  key={clapper.id}
                  className="flex items-center gap-3 py-2.5 rounded-lg"
                >
                  {clapper.avatar ? (
                    <img
                      src={clapper.avatar}
                      alt={clapper.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {clapper.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
