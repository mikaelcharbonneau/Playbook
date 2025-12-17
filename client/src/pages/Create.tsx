import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Save, Play } from "lucide-react";
import { ChatMessage, Game, GameDifficulty, GameFormat } from "@/types";
import { cn } from "@/lib/utils";
import { useGames } from "@/hooks/useGames";
import { GameModal } from "@/components/GameModal";

export default function Create() {
  const { addGame } = useGames();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi! I'm your AI learning assistant. Tell me what kind of game you want to create, or use the settings above to get started.",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previewGame, setPreviewGame] = useState<Game | null>(null);

  // Form State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("Beginner");
  const [format, setFormat] = useState<GameFormat>("Quiz");
  const [duration, setDuration] = useState("5");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      const newGame: Game = {
        id: `gen-${Date.now()}`,
        title: `Generated: ${topic || "Learning"} Game`,
        description: `A ${difficulty} level ${format} about ${topic || "various topics"}.`,
        topic: topic || "General",
        tags: ["AI Generated", format, difficulty],
        difficulty,
        durationMinutes: parseInt(duration),
        createdBy: { id: "ai", username: "AI Assistant", avatarUrl: "/images/avatar-placeholder.jpg" },
        createdAt: new Date().toISOString(),
        likesCount: 0,
        playsCount: 0,
        isBookmarked: false,
        thumbnailUrl: "/images/game-thumb-science.jpg", // Placeholder
        format,
        language: "English",
      };

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `I've created a ${difficulty} ${format} game about ${topic || "your request"}! It takes about ${duration} minutes.`,
        timestamp: Date.now(),
        relatedGame: newGame,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleGenerateFromSettings = () => {
    if (!topic) return;
    handleSendMessage(`Create a ${duration}-minute ${difficulty} ${format} about ${topic}.`);
  };

  const handleSaveGame = (game: Game) => {
    addGame(game);
    // Show toast (mock)
    alert("Game saved to your library!");
  };

  return (
    <div className="h-screen flex flex-col bg-background pb-20">
      {/* Configuration Panel */}
      <div className="p-4 bg-white shadow-sm z-10 rounded-b-3xl border-b border-border/50">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-primary fill-primary/20" /> Create Game
        </h1>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <Input 
              placeholder="Topic (e.g. Algebra, French Animals)" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-xl bg-muted/30 border-transparent focus:bg-white transition-all"
            />
          </div>
          <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
            <SelectTrigger className="rounded-xl bg-muted/30 border-transparent">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={format} onValueChange={(v: any) => setFormat(v)}>
            <SelectTrigger className="rounded-xl bg-muted/30 border-transparent">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Quiz">Quiz</SelectItem>
              <SelectItem value="Flashcards">Flashcards</SelectItem>
              <SelectItem value="Scenario">Scenario</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full rounded-full bg-primary text-primary-foreground shadow-glow font-bold"
          onClick={handleGenerateFromSettings}
          disabled={!topic}
        >
          Generate Game
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
              msg.role === "user" ? "self-end items-end" : "self-start items-start"
            )}
          >
            <div
              className={cn(
                "p-4 rounded-2xl text-sm shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-white text-foreground rounded-tl-sm border border-white/50"
              )}
            >
              {msg.content}
            </div>

            {msg.relatedGame && (
              <div className="mt-2 p-3 bg-white rounded-2xl shadow-soft border border-white/50 w-64 animate-in zoom-in-95 duration-300">
                <div className="aspect-video rounded-lg bg-muted mb-2 overflow-hidden relative">
                   <img src={msg.relatedGame.thumbnailUrl} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="text-white fill-white" size={32} />
                   </div>
                </div>
                <h3 className="font-bold text-sm truncate">{msg.relatedGame.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{msg.relatedGame.difficulty} • {msg.relatedGame.durationMinutes}m</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 rounded-full text-xs"
                    onClick={() => setPreviewGame(msg.relatedGame!)}
                  >
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 rounded-full text-xs"
                    onClick={() => handleSaveGame(msg.relatedGame!)}
                  >
                    <Save size={14} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="self-start bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-white/50">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-border/50">
        {/* Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2">
          {[
            "Quiz on World Capitals",
            "French Vocab Game",
            "Basic Algebra Test"
          ].map((s) => (
            <Badge 
              key={s} 
              variant="outline" 
              className="whitespace-nowrap cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors py-1.5 px-3 rounded-full"
              onClick={() => handleSendMessage(`Create a ${s}`)}
            >
              {s}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            placeholder="Describe a game to create..."
            className="rounded-full bg-muted/30 border-transparent focus:bg-white transition-all h-12 px-6"
          />
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-glow shrink-0"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
          >
            <Send size={20} className="ml-0.5" />
          </Button>
        </div>
      </div>

      <GameModal
        game={previewGame}
        isOpen={!!previewGame}
        onClose={() => setPreviewGame(null)}
      />
    </div>
  );
}
