import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Sparkles, Settings, MessageSquare, Loader2 } from "lucide-react";
import { ChatMessage, GameDifficulty, GameFormat, GameComplexity } from "@/types";
import { cn } from "@/lib/utils";
import { useGames } from "@/hooks/useGames";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TOPICS, FORMATS_BY_COMPLEXITY } from "@/lib/constants";

type CreateMode = "prompt" | "parameters";

export default function Create() {
  const [mode, setMode] = useState<CreateMode>("prompt");
  
  // Prompt Mode State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi! I'm your AI learning assistant. Describe the game you want to create, and I'll build it for you. For example: 'Create a fun quiz about photosynthesis for 8th graders' or 'Make flashcards to help me learn Spanish verbs'.",
      timestamp: Date.now(),
    },
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parameters Mode State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("Beginner");
  const [complexity, setComplexity] = useState<GameComplexity>("Basic");
  const [format, setFormat] = useState<GameFormat>("Quiz");
  const [duration, setDuration] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGameMutation = trpc.ai.generateGame.useMutation();
  const { refetch: refetchGames } = useGames();

  // Update format when complexity changes
  useEffect(() => {
    const availableFormats = FORMATS_BY_COMPLEXITY[complexity];
    if (!availableFormats.includes(format)) {
      setFormat(availableFormats[0]);
    }
  }, [complexity, format]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Prompt Mode: Send natural language request
  const handlePromptSubmit = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput("");
    setIsTyping(true);

    try {
      // For prompt mode, we'll use default parameters and let the AI interpret the prompt
      const result = await generateGameMutation.mutateAsync({
        topic: "General", // AI will extract from prompt
        difficulty: "Beginner",
        complexity: "Basic",
        format: "Quiz",
        durationMinutes: 10,
        language: "English",
        additionalInstructions: text, // The full prompt goes here
      });

      await refetchGames();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `✨ I've created "${result.title}"! ${result.description} You can find it in your Feed and start playing right away.`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      toast.success("Game created successfully!");
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I encountered an error while creating your game. Please try again with a different prompt.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error("Failed to generate game");
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  // Parameters Mode: Generate from structured inputs
  const handleParametersSubmit = async () => {
    if (!topic) {
      toast.error("Please select a topic");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateGameMutation.mutateAsync({
        topic,
        difficulty,
        complexity,
        format,
        durationMinutes: parseInt(duration),
        language: "English",
      });

      await refetchGames();

      toast.success(`"${result.title}" created successfully!`);
    } catch (error) {
      toast.error("Failed to generate game");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-mint-50 to-cream-50">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-black mb-2">Create Game</h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to create your game
        </p>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as CreateMode)} className="flex-1 flex flex-col">
        <TabsList className="mx-6 mb-4 grid w-auto grid-cols-2 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="prompt" className="gap-2">
            <MessageSquare size={16} />
            Prompt Mode
          </TabsTrigger>
          <TabsTrigger value="parameters" className="gap-2">
            <Settings size={16} />
            Parameters Mode
          </TabsTrigger>
        </TabsList>

        {/* Prompt Mode */}
        <TabsContent value="prompt" className="flex-1 flex flex-col m-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl p-4 shadow-sm",
                    msg.role === "user"
                      ? "bg-mint-500 text-white"
                      : "bg-white border border-gray-200"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input */}
          <div className="p-6 pt-0">
            <div className="flex gap-3">
              <Input
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePromptSubmit(promptInput);
                  }
                }}
                placeholder="Describe the game you want to create..."
                className="flex-1 rounded-full h-12 px-6 border-2 border-mint-200 focus:border-mint-400"
                disabled={isTyping}
              />
              <Button
                onClick={() => handlePromptSubmit(promptInput)}
                disabled={!promptInput.trim() || isTyping}
                size="icon"
                className="rounded-full h-12 w-12 bg-mint-500 hover:bg-mint-600"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Parameters Mode */}
        <TabsContent value="parameters" className="flex-1 flex flex-col m-0 px-6 pb-6">
          <Card className="p-6 space-y-6 bg-white/80 backdrop-blur-sm">
            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Topic</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="rounded-full h-12 border-2 border-mint-200">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Knowledge Level</label>
              <div className="flex gap-2">
                {(["Beginner", "Intermediate", "Advanced"] as GameDifficulty[]).map((d) => (
                  <Button
                    key={d}
                    variant={difficulty === d ? "default" : "outline"}
                    onClick={() => setDifficulty(d)}
                    className="flex-1 rounded-full"
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Game Complexity</label>
              <div className="flex gap-2">
                {(["Basic", "Normal", "Complex"] as GameComplexity[]).map((c) => (
                  <Button
                    key={c}
                    variant={complexity === c ? "default" : "outline"}
                    onClick={() => setComplexity(c)}
                    className="flex-1 rounded-full"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Game Format</label>
              <Select value={format} onValueChange={(v) => setFormat(v as GameFormat)}>
                <SelectTrigger className="rounded-full h-12 border-2 border-mint-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS_BY_COMPLEXITY[complexity].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="60"
                className="rounded-full h-12 border-2 border-mint-200"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleParametersSubmit}
              disabled={!topic || isGenerating}
              className="w-full rounded-full h-14 text-lg font-bold bg-mint-500 hover:bg-mint-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" size={20} />
                  Generate Game
                </>
              )}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
