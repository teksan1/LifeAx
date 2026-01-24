import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Plus } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConvMutation = trpc.chat.createConversation.useMutation();
  const getConversationsQuery = trpc.chat.getConversations.useQuery();
  const getMessagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversation || 0 },
    { enabled: !!selectedConversation }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

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

  const handleNewConversation = async () => {
    const title = `Conversation ${new Date().toLocaleDateString()}`;
    const result = await createConvMutation.mutateAsync({ title });
    if (result) {
      await getConversationsQuery.refetch();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        message: userMessage,
      });

      if (result.success) {
        await getMessagesQuery.refetch();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        {/* Conversations Sidebar */}
        <div className="md:col-span-1 border-2 border-foreground bg-card p-4 flex flex-col">
          <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
            Conversations
          </h3>

          <Button
            onClick={handleNewConversation}
            className="w-full mb-4 border-2 border-foreground font-bold uppercase"
            disabled={createConvMutation.isPending}
          >
            <Plus size={18} />
            New Chat
          </Button>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left px-3 py-2 border-2 transition-all text-sm ${
                  selectedConversation === conv.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                <p className="font-bold truncate">{conv.title}</p>
                <p className="text-xs opacity-75">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 border-2 border-foreground bg-card flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 border-b-2 border-foreground">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted-foreground font-bold uppercase">
                      Start a conversation with your AI life coach
                    </p>
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
              <div className="p-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask for life optimization advice..."
                    className="border-2 border-foreground font-mono"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="border-2 border-foreground font-bold uppercase"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-muted-foreground font-bold uppercase">
                Create a new conversation to begin
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
