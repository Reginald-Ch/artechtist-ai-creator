import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ChatbotGuideProps {
  context: 'welcome' | 'tribe-selection' | 'channel-tour' | 'first-message';
  onDismiss: () => void;
  onAction?: () => void;
}

export function ChatbotGuide({ context, onDismiss, onAction }: ChatbotGuideProps) {
  const [isVisible, setIsVisible] = useState(true);

  const messages = {
    'welcome': {
      title: "Hey there, future AI innovator! 🚀",
      content: "I'm your AI guide. I'll help you join a tribe and start your journey in this amazing community!",
      action: "Let's get started!"
    },
    'tribe-selection': {
      title: "Choose Your Tribe! 🎯",
      content: "Each tribe has unique challenges and projects. Pick one that matches your interests and join fellow innovators!",
      action: "Show me tribes"
    },
    'channel-tour': {
      title: "Welcome to Your Tribe! 🎉",
      content: "Here's where the magic happens! Chat with your tribe, share projects, compete in challenges, and climb the leaderboard!",
      action: "Got it!"
    },
    'first-message': {
      title: "Say Hello! 👋",
      content: "Don't be shy! Introduce yourself to your tribe members. They're excited to meet you!",
      action: "Open chat"
    }
  };

  const message = messages[context];

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="border-primary/50 bg-card/95 backdrop-blur-lg shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                      {message.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {onAction && (
                <Button
                  onClick={handleAction}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {message.action}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
