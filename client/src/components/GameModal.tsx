import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 5; // Mock steps
  const progress = ((step + 1) / totalSteps) * 100;

  if (!game) return null;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md h-[90vh] sm:h-auto flex flex-col p-0 gap-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-background">
        {/* Header */}
        <div className="p-6 pb-2 bg-gradient-to-b from-white to-transparent z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-foreground">{game.title}</h2>
              <p className="text-sm text-muted-foreground">{game.topic} • {game.difficulty}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X size={24} />
            </Button>
          </div>
          <Progress value={progress} className="h-2 rounded-full bg-muted" />
        </div>

        {/* Game Content Area (Mock) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-muted/30 relative">
          <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-sm border border-white/50 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-2xl">
              {step + 1}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Question {step + 1}</h3>
              <p className="text-muted-foreground">
                This is a mock question for the game "{game.title}". 
                Imagine a challenging question here related to {game.topic}.
              </p>
            </div>

            <div className="grid gap-3 w-full">
              {[1, 2, 3, 4].map((opt) => (
                <Button 
                  key={opt} 
                  variant="outline" 
                  className="w-full justify-start h-12 rounded-xl hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs mr-3 opacity-50">
                    {String.fromCharCode(64 + opt)}
                  </span>
                  Option {opt}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-white border-t border-border/50 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={step === 0}
            className="rounded-full px-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          {step === totalSteps - 1 ? (
            <Button onClick={onClose} className="rounded-full px-8 bg-primary text-primary-foreground shadow-glow">
              Finish <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="rounded-full px-8 bg-primary text-primary-foreground shadow-glow">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
