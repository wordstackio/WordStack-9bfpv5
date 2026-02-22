import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserInkBalance,
  giveClapsToPoet,
  getPoetSupporters,
  type PoetSupport,
} from "@/lib/storage";
import { shortTimeAgo } from "@/lib/utils";

interface GiveClapsOverlayProps {
  poetId: string;
  poetName: string;
  poetAvatar?: string;
  onClose: () => void;
  onSupported?: () => void;
}

const PRESETS = [1, 3, 5, 10];

export default function GiveClapsOverlay({
  poetId,
  poetName,
  poetAvatar,
  onClose,
  onSupported,
}: GiveClapsOverlayProps) {
  const user = getCurrentUser();
  const [amount, setAmount] = useState(3);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [supporters, setSupporters] = useState<PoetSupport[]>([]);
  const [balance, setBalance] = useState(user ? getUserInkBalance(user.id) : 0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Mock supporters seeded per poet
  const mockSupporters: PoetSupport[] = [
    {
      id: "ms-1",
      fromUserId: "user-1",
      fromUserName: "Sarah Mitchell",
      fromUserAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      toPoetId: poetId,
      amount: 5,
      message: "Your words always brighten my day!",
      createdAt: "2024-11-20T10:30:00Z",
    },
    {
      id: "ms-2",
      fromUserId: "user-4",
      fromUserName: "Leo Nguyen",
      fromUserAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
      toPoetId: poetId,
      amount: 10,
      message: "Keep writing, the world needs more of this.",
      createdAt: "2024-11-18T14:15:00Z",
    },
    {
      id: "ms-3",
      fromUserId: "user-3",
      fromUserName: "Priya Kapoor",
      fromUserAvatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop",
      toPoetId: poetId,
      amount: 3,
      createdAt: "2024-11-15T09:00:00Z",
    },
    {
      id: "ms-4",
      fromUserId: "user-5",
      fromUserName: "Amara Obi",
      fromUserAvatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop",
      toPoetId: poetId,
      amount: 1,
      message: "Beautiful.",
      createdAt: "2024-11-10T18:45:00Z",
    },
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const stored = getPoetSupporters(poetId);
    // Merge stored + mock (deduped)
    const storedIds = new Set(stored.map((s) => s.id));
    const merged = [
      ...stored,
      ...mockSupporters.filter((s) => !storedIds.has(s.id)),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setSupporters(merged);
    return () => {
      document.body.style.overflow = "";
    };
  }, [poetId]);

  const effectiveAmount = isCustom
    ? parseInt(customAmount, 10) || 0
    : amount;

  const dollarValue = (effectiveAmount * 0.01).toFixed(2);

  const handlePreset = (val: number) => {
    setIsCustom(false);
    setAmount(val);
    setError("");
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setError("");
  };

  const handleSupport = () => {
    if (!user) {
      setError("Please log in to give claps.");
      return;
    }
    if (effectiveAmount < 1) {
      setError("Choose at least 1 clap.");
      return;
    }
    if (effectiveAmount > balance) {
      setError(`Not enough Ink. You have ${balance} Ink.`);
      return;
    }

    const success = giveClapsToPoet(
      user.id,
      user.name,
      user.avatar,
      poetId,
      poetName,
      effectiveAmount,
      message.trim() || undefined
    );

    if (success) {
      setSent(true);
      setBalance(getUserInkBalance(user.id));
      // Refresh supporters list
      const stored = getPoetSupporters(poetId);
      const storedIds = new Set(stored.map((s) => s.id));
      const merged = [
        ...stored,
        ...mockSupporters.filter((s) => !storedIds.has(s.id)),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSupporters(merged);
      onSupported?.();
    } else {
      setError("Not enough Ink to give that many claps.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-background border border-border rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            {poetAvatar ? (
              <img
                src={poetAvatar}
                alt={poetName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground leading-tight">
                Give {poetName} a clap
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                1 clap = $0.01
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 pb-5">
          {sent ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="text-5xl mb-4">{"🎉"}</div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Thank you!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                You gave {poetName}{" "}
                {effectiveAmount} clap{effectiveAmount === 1 ? "" : "s"} ($
                {dollarValue}).
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setMessage("");
                  setAmount(3);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Give more claps
              </button>
            </div>
          ) : (
            <>
              {/* Quantity picker */}
              <div className="bg-accent/50 border border-border rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <span className="text-2xl">{"👏"}</span>
                  <span className="text-muted-foreground font-medium">
                    {"x"}
                  </span>
                  <div className="flex items-center gap-2">
                    {PRESETS.map((val) => (
                      <button
                        key={val}
                        onClick={() => handlePreset(val)}
                        className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                          !isCustom && amount === val
                            ? "bg-primary text-primary-foreground shadow-md scale-105"
                            : "bg-background border border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    {/* Custom input */}
                    <input
                      type="number"
                      min="1"
                      placeholder="#"
                      value={isCustom ? customAmount : ""}
                      onFocus={handleCustomFocus}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={`w-14 h-10 rounded-full text-center text-sm font-semibold transition-all outline-none ${
                        isCustom
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 placeholder:text-primary-foreground/50"
                          : "bg-background border border-border text-foreground hover:border-primary/50 placeholder:text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                rows={3}
                className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all mb-4"
              />

              {/* Error */}
              {error && (
                <p className="text-xs text-destructive mb-3 text-center">
                  {error}
                </p>
              )}

              {/* Support button */}
              <button
                onClick={handleSupport}
                disabled={effectiveAmount < 1}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                <span className="text-lg">{"👏"}</span>
                Support ${dollarValue}
              </button>

              {/* Balance hint */}
              {user && (
                <p className="text-xs text-muted-foreground text-center mt-2.5">
                  Your Ink balance: {balance}
                </p>
              )}
            </>
          )}

          {/* Recent Supporters */}
          {supporters.length > 0 && (
            <div className="mt-6 pt-5 border-t border-border">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">
                Recent Supporters
              </h3>
              <div className="space-y-4">
                {supporters.slice(0, 8).map((supporter) => (
                  <div key={supporter.id} className="flex gap-3">
                    {supporter.fromUserAvatar ? (
                      <img
                        src={supporter.fromUserAvatar}
                        alt={supporter.fromUserName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">
                          {supporter.fromUserName}
                        </span>{" "}
                        gave {supporter.amount} clap
                        {supporter.amount === 1 ? "" : "s"}.
                      </p>
                      {supporter.message && (
                        <p className="text-sm text-muted-foreground mt-0.5 break-words">
                          {supporter.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {shortTimeAgo(supporter.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
