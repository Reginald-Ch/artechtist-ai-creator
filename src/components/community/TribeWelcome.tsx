import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Users, MessageSquare, Trophy, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface TribeWelcomeProps {
  tribeName: string;
  tribeEmoji: string;
  tribeColor: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function TribeWelcome({ tribeName, tribeEmoji, tribeColor, onAccept, onDecline }: TribeWelcomeProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToConduct, setAgreedToConduct] = useState(false);

  const canProceed = agreedToTerms && agreedToConduct;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full border-primary/30 glow-primary">
        <CardHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="text-8xl mx-auto"
            style={{ filter: `drop-shadow(0 0 20px ${tribeColor}40)` }}
          >
            {tribeEmoji}
          </motion.div>
          <CardTitle className="text-4xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome to {tribeName}!
          </CardTitle>
          <CardDescription className="text-lg">
            You're about to join an amazing community of young innovators
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Connect & Collaborate</h4>
                <p className="text-xs text-muted-foreground">Chat with fellow tribe members</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/30">
              <Trophy className="h-5 w-5 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Compete & Earn</h4>
                <p className="text-xs text-muted-foreground">Join challenges and earn XP</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30">
              <MessageSquare className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Share Projects</h4>
                <p className="text-xs text-muted-foreground">Showcase your AI creations</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Learn Together</h4>
                <p className="text-xs text-muted-foreground">Grow your AI skills</p>
              </div>
            </div>
          </div>

          {/* Terms & Conduct */}
          <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-2">Community Guidelines</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to be respectful and kind to all members
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="conduct" 
                      checked={agreedToConduct}
                      onCheckedChange={(checked) => setAgreedToConduct(checked as boolean)}
                    />
                    <label htmlFor="conduct" className="text-sm cursor-pointer">
                      I will not share personal information and will report any inappropriate behavior
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onDecline}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground glow-primary"
              disabled={!canProceed}
              onClick={onAccept}
            >
              Join {tribeName}!
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
