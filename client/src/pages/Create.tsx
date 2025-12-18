import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, Settings, MessageSquare, Loader2 } from "lucide-react";
import { ChatMessage, GameDifficulty, GameFormat, GameComplexity } from "@/types";
import { cn } from "@/lib/utils";
import { useGames } from "@/hooks/useGames";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TOPICS, FORMATS_BY_COMPLEXITY } from "@/lib/constants";

type CreateMode = "prompt" | "parameters";

// Chat bubble component for consistent styling
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "16px"
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: "16px",
          backgroundColor: isUser ? "#5BBFB5" : "#ffffff",
          color: isUser ? "#ffffff" : "#333333",
          border: isUser ? "none" : "1px solid #e5e5e5",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
          {message.content}
        </p>
      </div>
    </div>
  );
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <div 
            style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: "#5BBFB5",
              animation: "bounce 1s infinite"
            }} 
          />
          <div 
            style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: "#5BBFB5",
              animation: "bounce 1s infinite 0.15s"
            }} 
          />
          <div 
            style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: "#5BBFB5",
              animation: "bounce 1s infinite 0.3s"
            }} 
          />
        </div>
      </div>
    </div>
  );
}

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
      const result = await generateGameMutation.mutateAsync({
        topic: "General",
        subject: "General",
        difficulty: "beginner",
        complexity: "basic",
        durationMinutes: 10,
        language: "English",
        customPrompt: text,
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
      const difficultyMap: Record<GameDifficulty, "beginner" | "intermediate" | "advanced"> = {
        "Beginner": "beginner",
        "Intermediate": "intermediate",
        "Advanced": "advanced"
      };
      const complexityMap: Record<GameComplexity, "basic" | "standard" | "complex"> = {
        "Basic": "basic",
        "Normal": "standard",
        "Complex": "complex"
      };

      const result = await generateGameMutation.mutateAsync({
        topic,
        subject: topic,
        difficulty: difficultyMap[difficulty],
        complexity: complexityMap[complexity],
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
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom, #F5FFFE, #FFFEF5)",
        paddingBottom: "100px" // Space for bottom nav
      }}
    >
      {/* Header */}
      <div style={{ padding: "24px 24px 16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px", color: "#1a1a1a" }}>
          Create Game
        </h1>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Choose how you want to create your game
        </p>
      </div>

      {/* Mode Toggle */}
      <div 
        style={{
          margin: "0 24px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
          padding: "4px",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          borderRadius: "12px",
          border: "1px solid #eee"
        }}
      >
        <button
          onClick={() => setMode("prompt")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            background: mode === "prompt" ? "#5BBFB5" : "transparent",
            color: mode === "prompt" ? "white" : "#666",
            boxShadow: mode === "prompt" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
          }}
        >
          <MessageSquare size={16} />
          Prompt Mode
        </button>
        <button
          onClick={() => setMode("parameters")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            background: mode === "parameters" ? "#5BBFB5" : "transparent",
            color: mode === "parameters" ? "white" : "#666",
            boxShadow: mode === "parameters" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
          }}
        >
          <Settings size={16} />
          Parameters Mode
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Prompt Mode */}
        {mode === "prompt" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Messages Container */}
            <div 
              style={{ 
                flex: 1, 
                overflowY: "auto", 
                padding: "0 24px 16px"
              }}
            >
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Input - Fixed at bottom */}
            <div 
              style={{
                padding: "16px 24px",
                background: "linear-gradient(to top, #F5FFFE, transparent)"
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
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
                  className="flex-1 rounded-full h-12 px-6"
                  style={{ 
                    border: "2px solid #B6EBE7",
                    background: "white"
                  }}
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handlePromptSubmit(promptInput)}
                  disabled={!promptInput.trim() || isTyping}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  style={{ background: "#5BBFB5", color: "white" }}
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Parameters Mode */}
        {mode === "parameters" && (
          <div style={{ flex: 1, padding: "0 24px 24px", overflowY: "auto" }}>
            <Card 
              className="p-6 space-y-6"
              style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}
            >
              {/* Topic */}
              <div className="space-y-2">
                <label className="text-sm font-bold" style={{ color: "#444" }}>Topic</label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger 
                    className="rounded-full h-12"
                    style={{ border: "2px solid #B6EBE7" }}
                  >
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
                <label className="text-sm font-bold" style={{ color: "#444" }}>Knowledge Level</label>
                <div className="flex gap-2">
                  {(["Beginner", "Intermediate", "Advanced"] as GameDifficulty[]).map((d) => (
                    <Button
                      key={d}
                      variant={difficulty === d ? "default" : "outline"}
                      onClick={() => setDifficulty(d)}
                      className="flex-1 rounded-full"
                      style={difficulty === d ? { background: "#5BBFB5", color: "white" } : {}}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              <div className="space-y-2">
                <label className="text-sm font-bold" style={{ color: "#444" }}>Game Complexity</label>
                <div className="flex gap-2">
                  {(["Basic", "Normal", "Complex"] as GameComplexity[]).map((c) => (
                    <Button
                      key={c}
                      variant={complexity === c ? "default" : "outline"}
                      onClick={() => setComplexity(c)}
                      className="flex-1 rounded-full"
                      style={complexity === c ? { background: "#5BBFB5", color: "white" } : {}}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <label className="text-sm font-bold" style={{ color: "#444" }}>Game Format</label>
                <Select value={format} onValueChange={(v) => setFormat(v as GameFormat)}>
                  <SelectTrigger 
                    className="rounded-full h-12"
                    style={{ border: "2px solid #B6EBE7" }}
                  >
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
                <label className="text-sm font-bold" style={{ color: "#444" }}>Duration (minutes)</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="60"
                  className="rounded-full h-12"
                  style={{ border: "2px solid #B6EBE7" }}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleParametersSubmit}
                disabled={!topic || isGenerating}
                className="w-full rounded-full h-14 text-lg font-bold"
                style={{ background: "#5BBFB5", color: "white" }}
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
          </div>
        )}
      </div>
    </div>
  );
}
