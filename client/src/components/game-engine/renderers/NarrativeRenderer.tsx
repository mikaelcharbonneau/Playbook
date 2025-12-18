import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  NarrativeSectionContent,
  NarrativeScene,
  NarrativeChoice,
  ChoiceCondition
} from "../../../../../shared/game-schema";
import { 
  ArrowRight,
  User,
  CheckCircle,
  XCircle,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NarrativeRendererProps {
  section: GameSection;
  gameState: GameState;
  config: GameConfig;
  scoring: ScoringConfig;
  onAnswer: (
    sectionId: string,
    itemId: string,
    answer: unknown,
    isCorrect: boolean,
    pointsEarned: number,
    timeSpent: number
  ) => void;
  onComplete: () => void;
  onUseHint: () => boolean;
  onNavigate: (sectionId: string) => void;
  onUpdateVariables: (updates: Record<string, unknown>) => void;
}

export function NarrativeRenderer({
  section,
  gameState,
  config,
  scoring,
  onAnswer,
  onComplete,
  onUpdateVariables,
}: NarrativeRendererProps) {
  const content = section.content as NarrativeSectionContent;
  const [currentSceneId, setCurrentSceneId] = useState(content.startScene);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [sceneStartTime, setSceneStartTime] = useState(Date.now());

  const currentScene = content.scenes.find(s => s.id === currentSceneId);

  // Typewriter effect
  useEffect(() => {
    if (!currentScene) return;
    
    setDisplayedText("");
    setIsTyping(true);
    setSceneStartTime(Date.now());
    
    const text = currentScene.text;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [currentSceneId, currentScene]);

  // Process scene actions when entering
  useEffect(() => {
    if (!currentScene?.actions) return;
    
    currentScene.actions.forEach(action => {
      if (action.type === "set-variable") {
        const { variable, value } = action.payload as { variable: string; value: unknown };
        onUpdateVariables({ [variable]: value });
      } else if (action.type === "add-score") {
        const { points } = action.payload as { points: number };
        onAnswer(section.id, currentSceneId, "scene-bonus", true, points, 0);
      }
    });
  }, [currentSceneId]);

  const skipTyping = () => {
    if (currentScene) {
      setDisplayedText(currentScene.text);
      setIsTyping(false);
    }
  };

  const checkCondition = (condition: ChoiceCondition): boolean => {
    const value = gameState.variables[condition.variable];
    
    switch (condition.operator) {
      case "==": return value === condition.value;
      case "!=": return value !== condition.value;
      case ">": return Number(value) > Number(condition.value);
      case "<": return Number(value) < Number(condition.value);
      case ">=": return Number(value) >= Number(condition.value);
      case "<=": return Number(value) <= Number(condition.value);
      default: return true;
    }
  };

  const handleChoice = (choice: NarrativeChoice) => {
    const timeSpent = Math.round((Date.now() - sceneStartTime) / 1000);
    
    // Apply choice effects
    if (choice.effects) {
      choice.effects.forEach(effect => {
        if (effect.type === "set-variable") {
          onUpdateVariables({ [effect.target]: effect.value });
        } else if (effect.type === "add-score") {
          onAnswer(
            section.id, 
            `${currentSceneId}-${choice.id}`, 
            choice.text, 
            true, 
            Number(effect.value), 
            timeSpent
          );
        }
      });
    }

    // Navigate to target scene
    setCurrentSceneId(choice.targetScene);
  };

  const handleContinue = () => {
    if (!currentScene) return;
    
    if (currentScene.isEnding) {
      // Record ending
      const timeSpent = Math.round((Date.now() - sceneStartTime) / 1000);
      const isSuccess = currentScene.endingType === "success";
      const points = isSuccess ? scoring.pointsPerCorrect * 5 : 0;
      
      onAnswer(
        section.id,
        currentSceneId,
        currentScene.endingType,
        isSuccess,
        points,
        timeSpent
      );
      
      onComplete();
    } else if (currentScene.nextScene) {
      setCurrentSceneId(currentScene.nextScene);
    }
  };

  // Filter choices based on conditions
  const availableChoices = currentScene?.choices?.filter(choice => {
    if (!choice.condition) return true;
    return checkCondition(choice.condition);
  }) || [];

  if (!currentScene) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-muted-foreground">Scene not found</p>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundImage: currentScene.background 
          ? `url(${currentScene.background})` 
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Overlay for readability */}
      <div className="h-full flex flex-col bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Spacer */}
        <div className="flex-1" onClick={isTyping ? skipTyping : undefined} />

        {/* Dialog box */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          {/* Speaker */}
          {currentScene.speaker && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-white">
                {currentScene.speaker}
              </span>
            </div>
          )}

          {/* Text */}
          <div 
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-4 min-h-[100px]"
            onClick={isTyping ? skipTyping : undefined}
          >
            <p className="text-lg leading-relaxed">
              {displayedText}
              {isTyping && (
                <span className="animate-pulse">|</span>
              )}
            </p>
          </div>

          {/* Ending indicator */}
          {currentScene.isEnding && !isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "mb-4 p-3 rounded-xl flex items-center gap-2",
                currentScene.endingType === "success" && "bg-green-500/20",
                currentScene.endingType === "failure" && "bg-red-500/20",
                currentScene.endingType === "neutral" && "bg-gray-500/20"
              )}
            >
              {currentScene.endingType === "success" && (
                <>
                  <Trophy className="h-5 w-5 text-green-400" />
                  <span className="text-green-100 font-medium">Story Complete!</span>
                </>
              )}
              {currentScene.endingType === "failure" && (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-100 font-medium">Try Again</span>
                </>
              )}
              {currentScene.endingType === "neutral" && (
                <>
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-100 font-medium">The End</span>
                </>
              )}
            </motion.div>
          )}

          {/* Choices or Continue button */}
          {!isTyping && (
            <AnimatePresence>
              {availableChoices.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {availableChoices.map((choice, index) => (
                    <motion.div
                      key={choice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handleChoice(choice)}
                        className="w-full h-auto py-3 px-4 text-left justify-start bg-white/90 hover:bg-white"
                      >
                        <ArrowRight className="h-4 w-4 mr-2 shrink-0" />
                        <span>{choice.text}</span>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleContinue}
                    className="w-full h-12"
                  >
                    {currentScene.isEnding ? "Finish" : "Continue"}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Tap to continue hint */}
          {isTyping && (
            <p className="text-center text-white/60 text-sm">
              Tap to skip
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
