import { createContext, useContext, useState, ReactNode } from "react";

// Context for managing comments overlay visibility state
interface CommentsOverlayContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CommentsOverlayContext = createContext<CommentsOverlayContextType | undefined>(undefined);

export function CommentsOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CommentsOverlayContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CommentsOverlayContext.Provider>
  );
}

export function useCommentsOverlay() {
  const context = useContext(CommentsOverlayContext);
  if (context === undefined) {
    throw new Error("useCommentsOverlay must be used within CommentsOverlayProvider");
  }
  return context;
}
