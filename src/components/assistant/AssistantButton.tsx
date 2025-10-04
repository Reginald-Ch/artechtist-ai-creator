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

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform z-50"
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
