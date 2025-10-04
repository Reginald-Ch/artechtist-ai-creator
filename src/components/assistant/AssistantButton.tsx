import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { PhoneAssistantSimulator } from './PhoneAssistantSimulator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Node, Edge } from '@xyflow/react';

interface AssistantButtonProps {
  nodes?: Node[];
  edges?: Edge[];
  botName?: string;
  botAvatar?: string;
}

export const AssistantButton = ({
  nodes = [],
  edges = [],
  botName,
  botAvatar,
}: AssistantButtonProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  // Debug log to confirm mounting
  console.log('AssistantButton mounted with avatar:', botAvatar);

  return (
    <>
      <Button
        onClick={() => {
          console.log('Assistant button clicked');
          setOpen(true);
        }}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl hover:scale-110 transition-all duration-300 z-[9999] animate-pulse hover:animate-none border-2 border-primary/50"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      <PhoneAssistantSimulator
        open={open}
        onOpenChange={setOpen}
        nodes={nodes}
        edges={edges}
        botName={botName || t('assistant.defaultName', 'AI Assistant')}
        botAvatar={botAvatar || '🤖'}
      />
    </>
  );
};
