import { useState, useRef, useEffect } from "react";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ChatSimulator = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your AI friend! How can I help you today? 🚀", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulated AI responses
  const aiResponses = [
    "That’s an awesome question! 🌟",
    "Let’s explore that idea together! 🚀",
    "Wow, you’re curious! Let me think... 🤔",
    "Good one! Here’s what I know about that. 💡",
    "Space, AI, science — you name it! Let’s go! 🌍"
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  // Voice input functionality
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[380px] h-[720px] bg-card rounded-[3rem] shadow-2xl border-[12px] border-foreground/10 overflow-hidden">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-foreground/10 rounded-b-3xl z-10" />

        {/* Screen */}
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="px-6 pt-10 pb-4 bg-gradient-to-r from-primary to-secondary">
            <h2 className="text-xl font-bold text-white text-center font-fun">
              AI Chat Friend 🤖
            </h2>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-md transition-all ${
                      msg.isUser
                        ? "bg-muted text-foreground rounded-br-md"
                        : "bg-card text-foreground border-2 border-primary/20 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-card border border-primary/20 px-4 py-2 rounded-2xl text-sm text-muted-foreground">
                    🤖 Typing...
                  </div>
                </div>
              )}
              <div ref={scrollRef}></div>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-background"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                className="rounded-full bg-secondary hover:bg-secondary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Voice Input Button */}
            <div className="flex justify-center mt-3">
              <Button
                size="lg"
                onClick={handleVoiceInput}
                className={`rounded-full w-16 h-16 transition-all ${
                  isRecording
                    ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                    : "bg-gradient-to-br from-primary via-secondary to-accent hover:scale-110"
                }`}
              >
                <Mic className="h-7 w-7 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSimulator;
