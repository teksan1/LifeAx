import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Plus, AlertTriangle, TrendingUp, Brain } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function ChatEnhanced() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stressLevel, setStressLevel] = useState(0);
  const [riskLevel, setRiskLevel] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConvMutation = trpc.chat.createConversation.useMutation();
  const getConversationsQuery = trpc.chat.getConversations.useQuery();
  const getMessagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversation || 0 },
    { enabled: !!selectedConversation }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const analyzeEIMutation = trpc.emotionalIntelligence.analyzeConversation.useMutation();

  useEffect(() => {
    if (getConversationsQuery.data) {
      setConversations(getConversationsQuery.data);
      if (!selectedConversation && getConversationsQuery.data.length > 0) {
        setSelectedConversation(getConversationsQuery.data[0].id);
      }
    }
  }, [getConversationsQuery.data]);

  useEffect(() => {
    if (getMessagesQuery.data) {
      setMessages(getMessagesQuery.data);
    }
  }, [getMessagesQuery.data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectEmotionalState = (text: string) => {
    const stressKeywords = [
      "stressed",
      "anxious",
      "worried",
      "overwhelmed",
      "panic",
      "scared",
      "afraid",
      "terrible",
      "horrible",
      "depressed",
    ];
    const riskKeywords = [
      "quit",
      "leave",
      "break",
      "end",
      "give up",
      "extreme",
      "reckless",
      "dangerous",
      "impulsive",
      "all or nothing",
    ];

    let stress = 0;
    let risk = 0;

    stressKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) stress += 15;
    });

    riskKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) risk += 20;
    });

    return {
      stress: Math.min(stress, 100),
      risk: Math.min(risk, 100),
    };
  };

  const handleNewConversation = async () => {
    const title = `Life Chat ${new Date().toLocaleDateString()}`;
    try {
      const result = await createConvMutation.mutateAsync({ title });
      if (result) {
        await getConversationsQuery.refetch();
        toast.success("New conversation started");
      }
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    const userMessage = input;
    const emotionalState = detectEmotionalState(userMessage);

    setStressLevel(emotionalState.stress);
    setRiskLevel(emotionalState.risk);

    if (emotionalState.stress > 70 || emotionalState.risk > 75) {
      setShowWarning(true);
    }

    setInput("");
    setLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        message: userMessage,
      });

      if (result.success) {
        await analyzeEIMutation.mutateAsync({
          conversationId: selectedConversation,
          stressLevel: emotionalState.stress,
          riskLevel: emotionalState.risk,
          sentiment: emotionalState.stress > 50 ? "negative" : "neutral",
          emotionalKeywords: [],
          decisionRisks:
            emotionalState.risk > 50
              ? ["Potential impulsive decision detected"]
              : [],
        });

        await getMessagesQuery.refetch();
        toast.success("Message sent");
      }
    } catch (error) {
      toast.error("Failed to send message");
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="md:col-span-1 border-2 border-foreground bg-card p-4 flex flex-col overflow-hidden">
          <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
            Conversations
          </h3>

          <Button
            onClick={handleNewConversation}
            className="w-full mb-4 border-2 border-foreground font-bold uppercase text-sm"
            disabled={createConvMutation.isPending}
          >
            <Plus size={16} />
            New Chat
          </Button>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No conversations yet
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 border-2 transition-all text-sm ${
                    selectedConversation === conv.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  <p className="font-bold truncate">{conv.title}</p>
                  <p className="text-xs opacity-75">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 border-2 border-foreground bg-card flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Emotional State Indicators */}
              {(stressLevel > 0 || riskLevel > 0) && (
                <div className="border-b-2 border-foreground p-4 bg-muted">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain size={16} />
                        <span className="text-xs font-bold uppercase">Stress Level</span>
                      </div>
                      <div className="w-full bg-background border-2 border-foreground h-2">
                        <div
                          className="bg-destructive h-full transition-all"
                          style={{ width: `${stressLevel}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">{stressLevel}%</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold uppercase">Risk Level</span>
                      </div>
                      <div className="w-full bg-background border-2 border-foreground h-2">
                        <div
                          className="bg-destructive h-full transition-all"
                          style={{ width: `${riskLevel}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">{riskLevel}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Alert */}
              {showWarning && (stressLevel > 70 || riskLevel > 75) && (
                <div className="border-b-2 border-destructive bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-destructive flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold uppercase text-destructive mb-1">
                        Decision Alert
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        I've detected elevated stress or risk levels. Before making any major
                        decisions, let's talk through this carefully. What's on your mind?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 border-b-2 border-foreground">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl font-black mb-2">🧠</div>
                      <p className="text-center text-muted-foreground font-bold uppercase">
                        Share your thoughts and I'll listen
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-3 border-2 ${
                          msg.role === "user"
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground bg-background text-foreground"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 border-2 border-foreground bg-background">
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 space-y-2 border-t-2 border-foreground">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Share your thoughts..."
                    className="border-2 border-foreground font-mono text-sm"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="border-2 border-foreground font-bold uppercase"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl font-black mb-4">💬</div>
                <p className="text-center text-muted-foreground font-bold uppercase">
                  Start a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
