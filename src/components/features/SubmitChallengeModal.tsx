import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Challenge } from "@/types";
import { Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubmitChallengeModalProps {
  challenge: Challenge | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitChallengeModal({
  challenge,
  isOpen,
  onClose,
}: SubmitChallengeModalProps) {
  const [step, setStep] = useState<"select" | "preview" | "confirm">("select");
  const [poemTitle, setPoemTitle] = useState("");
  const [poemContent, setPoemContent] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");

  const handleReset = () => {
    setStep("select");
    setPoemTitle("");
    setPoemContent("");
    setSubmissionNote("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    // TODO: Submit poem to challenge
    console.log("Submitting poem to challenge:", {
      challengeId: challenge?.id,
      poemTitle,
      poemContent,
      submissionNote,
    });
    handleClose();
  };

  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {step === "select" && "Paste Your Poem"}
            {step === "preview" && "Preview & Confirm"}
            {step === "confirm" && "Submit to Challenge"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" &&
              `Submit your poem to "${challenge.theme}" for ${challenge.inkCost} Ink`}
            {step === "preview" && "Review your poem before submission"}
            {step === "confirm" &&
              "Confirm your submission and view it in the feed"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Paste Poem */}
          {step === "select" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Poem Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter poem title"
                  value={poemTitle}
                  onChange={(e) => setPoemTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">
                  Poem Content
                </Label>
                <Textarea
                  id="content"
                  placeholder="Paste or type your poem here..."
                  value={poemContent}
                  onChange={(e) => setPoemContent(e.target.value)}
                  className="min-h-64 text-base resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-base font-semibold">
                  Optional Note
                </Label>
                <Textarea
                  id="note"
                  placeholder="Add a note about your submission (visible in the feed)"
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  className="min-h-20 text-sm resize-none"
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 ml-2">
                  Submitting will deduct <strong>{challenge.inkCost} Ink</strong> from your wallet
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("preview")}
                  disabled={!poemTitle.trim() || !poemContent.trim()}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && (
            <>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                  {poemTitle}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap font-serif leading-relaxed">
                  {poemContent}
                </p>
                {submissionNote && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground italic">
                      {submissionNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => setStep("confirm")}
                >
                  Confirm & Submit
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirm" && (
            <>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">Ready to submit?</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your poem will appear in the challenge feed immediately
                  </p>
                </div>

                <div className="space-y-3 bg-card p-4 rounded-lg border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Poem</span>
                    <span className="font-semibold text-foreground">{poemTitle}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Challenge</span>
                    <span className="font-semibold text-foreground">
                      {challenge.theme}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-border">
                    <span className="text-muted-foreground">Ink Cost</span>
                    <span className="font-semibold text-primary">
                      -{challenge.inkCost} Ink
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("preview")}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Submit Poem
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
