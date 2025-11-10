import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Loader2, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const systemPrompt = `You are a knowledgeable home remedies and natural health assistant. Provide helpful, safe, and evidence-based advice about:
- Natural home remedies for common health issues
- Yoga poses (Yogasan) for specific conditions
- Acupressure points and their benefits
- Dietary recommendations
- Lifestyle modifications
- Preventive care tips

Always include safety warnings when appropriate and remind users to consult healthcare professionals for serious conditions.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: systemPrompt + '\n\nUser question: ' + userMessage }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "I apologize, but I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse }
      ]);
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Split by emoji headers and format sections
    const sections = content.split(/(?=🌿|🧘|👆|🥗|💡|⚠️)/);
    return sections.map((section, idx) => (
      <div key={idx} className="mb-4 last:mb-0">
        {section.split('\n').map((line, lineIdx) => {
          if (line.trim().startsWith('🌿') || 
              line.trim().startsWith('🧘') || 
              line.trim().startsWith('👆') ||
              line.trim().startsWith('🥗') ||
              line.trim().startsWith('💡') ||
              line.trim().startsWith('⚠️')) {
            return (
              <h3 key={lineIdx} className="font-semibold text-primary mt-4 mb-2 flex items-center gap-2">
                {line}
              </h3>
            );
          }
          if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
            return (
              <li key={lineIdx} className="ml-4 mb-1 text-sm">
                {line.replace(/^[-•]\s*/, '')}
              </li>
            );
          }
          return line.trim() && (
            <p key={lineIdx} className="text-sm mb-2 leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    ));
  };

  return (
    <>
      {/* Floating AI Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full w-16 h-16 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-intense)] bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-all duration-300"
            >
              <Sparkles className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="h-full flex flex-col bg-gradient-to-b from-card via-card to-muted/20 border-2 border-primary/20 shadow-[var(--shadow-glow)]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground font-poppins">AI Remedy Assistant</h3>
                    <p className="text-xs text-muted-foreground">Powered by Gemini</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-muted/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h4 className="font-semibold text-foreground mb-2 font-poppins">
                      Ask me anything about:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>🌿 Natural home remedies</li>
                      <li>🧘 Yoga poses for health</li>
                      <li>👆 Acupressure techniques</li>
                      <li>🥗 Dietary recommendations</li>
                      <li>💡 Holistic wellness tips</li>
                    </ul>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          {formatMessage(msg.content)}
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about remedies, yoga, acupressure..."
                    className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] max-h-[100px]"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="rounded-xl w-11 h-11 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
