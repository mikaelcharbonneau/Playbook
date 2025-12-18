import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  SimulationSectionContent,
  SimulationState,
  SimAction,
  SimEvent,
  SimObjective
} from "../../../../../shared/game-schema";
import { 
  Play,
  SkipForward,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationRendererProps {
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

export function SimulationRenderer({
  section,
  gameState,
  scoring,
  onAnswer,
  onComplete,
}: SimulationRendererProps) {
  const content = section.content as SimulationSectionContent;
  
  const [simState, setSimState] = useState<SimulationState>(content.initialState);
  const [currentEvent, setCurrentEvent] = useState<SimEvent | null>(null);
  const [actionCooldowns, setActionCooldowns] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);

  // Check win/lose conditions
  useEffect(() => {
    const requiredObjectives = content.objectives.filter(o => o.required);
    const completedRequired = requiredObjectives.filter(o => 
      simState.completedObjectives.includes(o.id)
    );

    // Check if all required objectives are complete
    if (completedRequired.length === requiredObjectives.length && requiredObjectives.length > 0) {
      endGame("win");
      return;
    }

    // Check if out of turns
    if (simState.turn >= content.maxTurns) {
      endGame(completedRequired.length > 0 ? "win" : "lose");
      return;
    }

    // Check if any resource is at critical level
    for (const resource of content.resources) {
      const value = simState.resources[resource.id] || 0;
      if (value <= resource.minValue) {
        endGame("lose");
        return;
      }
    }
  }, [simState]);

  const endGame = (result: "win" | "lose") => {
    setIsGameOver(true);
    setGameResult(result);
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const completedObjectives = content.objectives.filter(o => 
      simState.completedObjectives.includes(o.id)
    );
    const totalPoints = completedObjectives.reduce((sum, o) => sum + o.points, 0);
    
    onAnswer(
      section.id,
      section.id,
      { result, turn: simState.turn, completedObjectives: simState.completedObjectives },
      result === "win",
      totalPoints,
      timeSpent
    );
  };

  const canPerformAction = (action: SimAction): boolean => {
    // Check cooldown
    if (actionCooldowns[action.id] && actionCooldowns[action.id] > 0) {
      return false;
    }

    // Check if unlocked
    if (action.unlockCondition && !simState.unlockedActions.includes(action.id)) {
      return false;
    }

    // Check cost
    for (const [resourceId, cost] of Object.entries(action.cost)) {
      if ((simState.resources[resourceId] || 0) < cost) {
        return false;
      }
    }

    return true;
  };

  const performAction = (action: SimAction) => {
    if (!canPerformAction(action)) return;

    setSimState(prev => {
      const newResources = { ...prev.resources };
      
      // Deduct costs
      for (const [resourceId, cost] of Object.entries(action.cost)) {
        newResources[resourceId] = (newResources[resourceId] || 0) - cost;
      }
      
      // Apply effects
      for (const [resourceId, effect] of Object.entries(action.effects)) {
        newResources[resourceId] = Math.max(
          content.resources.find(r => r.id === resourceId)?.minValue || 0,
          Math.min(
            content.resources.find(r => r.id === resourceId)?.maxValue || 100,
            (newResources[resourceId] || 0) + effect
          )
        );
      }

      return { ...prev, resources: newResources };
    });

    // Set cooldown
    if (action.cooldown) {
      setActionCooldowns(prev => ({
        ...prev,
        [action.id]: action.cooldown || 0
      }));
    }
  };

  const advanceTurn = () => {
    // Reduce cooldowns
    setActionCooldowns(prev => {
      const newCooldowns: Record<string, number> = {};
      for (const [actionId, cooldown] of Object.entries(prev)) {
        if (cooldown > 1) {
          newCooldowns[actionId] = cooldown - 1;
        }
      }
      return newCooldowns;
    });

    // Check for random events
    const possibleEvents = content.events.filter(event => {
      if (event.conditions) {
        // Simple condition check - could be expanded
        return true;
      }
      return Math.random() < event.probability;
    });

    if (possibleEvents.length > 0) {
      const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      setCurrentEvent(randomEvent);
    } else {
      // Just advance turn
      setSimState(prev => ({ ...prev, turn: prev.turn + 1 }));
    }

    // Check objectives
    checkObjectives();
  };

  const handleEventChoice = (choiceIndex: number) => {
    if (!currentEvent) return;

    const choice = currentEvent.choices?.[choiceIndex];
    const effects = choice?.effects || currentEvent.effects;

    setSimState(prev => {
      const newResources = { ...prev.resources };
      
      for (const [resourceId, effect] of Object.entries(effects)) {
        newResources[resourceId] = Math.max(
          content.resources.find(r => r.id === resourceId)?.minValue || 0,
          Math.min(
            content.resources.find(r => r.id === resourceId)?.maxValue || 100,
            (newResources[resourceId] || 0) + effect
          )
        );
      }

      return { ...prev, resources: newResources, turn: prev.turn + 1 };
    });

    setCurrentEvent(null);
  };

  const checkObjectives = () => {
    setSimState(prev => {
      const newCompleted = [...prev.completedObjectives];
      
      for (const objective of content.objectives) {
        if (newCompleted.includes(objective.id)) continue;
        
        let completed = false;
        
        switch (objective.type) {
          case "reach-value":
            completed = (prev.resources[objective.target] || 0) >= objective.value;
            break;
          case "survive-turns":
            completed = prev.turn >= objective.value;
            break;
          // Add more objective types as needed
        }
        
        if (completed) {
          newCompleted.push(objective.id);
        }
      }
      
      return { ...prev, completedObjectives: newCompleted };
    });
  };

  const getResourcePercentage = (resourceId: string) => {
    const resource = content.resources.find(r => r.id === resourceId);
    if (!resource) return 0;
    const value = simState.resources[resourceId] || 0;
    return ((value - resource.minValue) / (resource.maxValue - resource.minValue)) * 100;
  };

  if (isGameOver) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6",
            gameResult === "win" ? "bg-green-100" : "bg-red-100"
          )}
        >
          {gameResult === "win" ? (
            <Trophy className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">
          {gameResult === "win" ? "Simulation Complete!" : "Game Over"}
        </h2>
        
        <p className="text-muted-foreground mb-6 text-center">
          {gameResult === "win" 
            ? "You successfully managed your resources!"
            : "Better luck next time. Try a different strategy."}
        </p>

        <div className="bg-white rounded-xl p-4 mb-6 w-full max-w-sm">
          <p className="text-sm text-muted-foreground mb-2">Final Stats:</p>
          <p className="font-medium">Turns: {simState.turn} / {content.maxTurns}</p>
          <p className="font-medium">
            Objectives: {simState.completedObjectives.length} / {content.objectives.length}
          </p>
        </div>

        <Button onClick={onComplete} className="w-full max-w-sm h-12">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">
          Turn {simState.turn + 1} / {content.maxTurns}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={advanceTurn}
          disabled={!!currentEvent}
        >
          <SkipForward className="h-4 w-4 mr-1" />
          End Turn
        </Button>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">Resources</h3>
        {content.resources.map(resource => {
          const value = simState.resources[resource.id] || 0;
          const percentage = getResourcePercentage(resource.id);
          const isLow = percentage < 25;

          return (
            <div key={resource.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{resource.icon}</span>
                  <span className="text-sm font-medium">{resource.name}</span>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  isLow && "text-red-500"
                )}>
                  {Math.round(value)}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={cn("h-2", isLow && "[&>div]:bg-red-500")}
              />
            </div>
          );
        })}
      </div>

      {/* Objectives */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Objectives</h3>
        <div className="space-y-2">
          {content.objectives.map(objective => {
            const isComplete = simState.completedObjectives.includes(objective.id);
            
            return (
              <div 
                key={objective.id}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  isComplete && "text-green-600"
                )}
              >
                {isComplete ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2" />
                )}
                <span className={isComplete ? "line-through" : ""}>
                  {objective.description}
                </span>
                {objective.required && !isComplete && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {currentEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold">{currentEvent.name}</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">
                {currentEvent.description}
              </p>

              {currentEvent.choices && currentEvent.choices.length > 0 ? (
                <div className="space-y-2">
                  {currentEvent.choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleEventChoice(index)}
                      className="w-full justify-start"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              ) : (
                <Button
                  onClick={() => handleEventChoice(-1)}
                  className="w-full"
                >
                  Continue
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex-1 overflow-auto">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {content.actions.map(action => {
            const canPerform = canPerformAction(action);
            const cooldown = actionCooldowns[action.id] || 0;

            return (
              <motion.button
                key={action.id}
                onClick={() => performAction(action)}
                disabled={!canPerform || !!currentEvent}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  canPerform && !currentEvent
                    ? "bg-white border-gray-200 hover:border-primary"
                    : "bg-gray-100 border-gray-200 opacity-50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{action.icon}</span>
                  <span className="font-medium text-sm">{action.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {action.description}
                </p>
                
                {/* Cost */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(action.cost).map(([resourceId, cost]) => {
                    const resource = content.resources.find(r => r.id === resourceId);
                    return (
                      <span 
                        key={resourceId}
                        className="text-xs bg-red-100 text-red-700 px-1 rounded"
                      >
                        -{cost} {resource?.icon}
                      </span>
                    );
                  })}
                  {Object.entries(action.effects).map(([resourceId, effect]) => {
                    const resource = content.resources.find(r => r.id === resourceId);
                    return (
                      <span 
                        key={resourceId}
                        className="text-xs bg-green-100 text-green-700 px-1 rounded"
                      >
                        +{effect} {resource?.icon}
                      </span>
                    );
                  })}
                </div>

                {cooldown > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Cooldown: {cooldown} turns
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
