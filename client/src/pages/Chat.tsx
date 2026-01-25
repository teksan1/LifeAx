import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Plus, Trash2, Copy, Download } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConvMutation = trpc.chat.createConversation.useMutation();
  const getConversationsQuery = trpc.chat.getConversations.useQuery();
  const getMessagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversation || 0 },
    { enabled: !!selectedConversation }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  // Delete conversation not yet implemented

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
    const title = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    try {
      const result = await createConvMutation.mutateAsync({ title });
      if (result) {
        await getConversationsQuery.refetch();
        toast.success("New conversation created");
      }
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  // Delete conversation not yet implemented

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
        toast.success("Message sent");
      }
    } catch (error) {
      toast.error("Failed to send message");
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleExportConversation = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const content = messages
      .map((msg) => `[${msg.role.toUpperCase()}]\n${msg.content}\n`)
      .join("\n---\n\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `conversation-${selectedConversation}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Conversation exported");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations Sidebar */}
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

          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="border-2 border-foreground font-mono text-sm mb-4"
          />

          <div className="flex-1 space-y-2 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No conversations found</p>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-2 border-2 transition-all ${
                    selectedConversation === conv.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  <button
                    onClick={() => setSelectedConversation(conv.id)}
                    className="flex-1 text-left px-3 py-2 text-sm"
                  >
                    <p className="font-bold truncate">{conv.title}</p>
                    <p className="text-xs opacity-75">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  {/* Delete option */}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 border-2 border-foreground bg-card flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 border-b-2 border-foreground">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl font-black mb-2">💬</div>
                      <p className="text-center text-muted-foreground font-bold uppercase">
                        Start a conversation with your AI life coach
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
                        className={`max-w-xs md:max-w-md px-4 py-3 border-2 group relative ${
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
                        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="p-1 bg-foreground text-background hover:bg-accent transition-all"
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
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

              {/* Input & Actions */}
              <div className="p-4 space-y-2 border-t-2 border-foreground">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask for life optimization advice... (Shift+Enter for new line)"
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
                {messages.length > 0 && (
                  <Button
                    onClick={handleExportConversation}
                    variant="outline"
                    className="w-full border-2 border-foreground font-bold uppercase text-sm"
                  >
                    <Download size={14} />
                    Export Conversation
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl font-black mb-4">📝</div>
                <p className="text-center text-muted-foreground font-bold uppercase">
                  Create a new conversation to begin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
