import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, PenLine, MessageSquare, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function FAB() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !user.isPoet) return null;

  const actions = [
    {
      id: "poem",
      icon: PenLine,
      label: "Write a Poem",
      description: "Create and publish new poetry",
      action: () => {
        setIsOpen(false);
        navigate("/write");
      }
    },
    {
      id: "update",
      icon: MessageSquare,
      label: "Post Update",
      description: "Share a quick thought with followers",
      action: () => {
        setIsOpen(false);
        navigate("/community/compose");
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-bottom-2 duration-200">
          <Card className="p-2 shadow-2xl min-w-[280px]">
            <div className="space-y-1">
              {actions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
          isOpen ? "rotate-45" : ""
        }`}
        aria-label="Create content"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
