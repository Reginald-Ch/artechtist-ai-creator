import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, Trash2, GraduationCap } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntentListItemProps {
  node: Node;
  isSelected: boolean;
  index: number;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenTraining: (id: string) => void;
}

export const IntentListItem: React.FC<IntentListItemProps> = ({
  node,
  isSelected,
  index,
  onSelect,
  onDelete,
  onOpenTraining
}) => {
  const { t } = useLanguage();
  const trainingCount = Array.isArray(node.data.trainingPhrases) ? node.data.trainingPhrases.length : 0;
  const responseCount = Array.isArray(node.data.responses) ? node.data.responses.length : 0;
  const isDefault = Boolean(node.data.isDefault);
  const label = String(node.data.label || 'Untitled');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      layout
      className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border hover:border-primary/50 bg-background'
      }`}
      onClick={() => onSelect(node.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold truncate">
              {label}
            </span>
            {isDefault && (
              <Badge variant="secondary" className="text-xs">
                {t('botBuilder.core')}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <MessageSquare className="h-3 w-3 text-blue-500" />
              <span>{trainingCount}</span>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <Bot className="h-3 w-3 text-green-500" />
              <span>{responseCount}</span>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTraining(node.id);
            }}
            title={t('botBuilder.trainIntent')}
          >
            <GraduationCap className="h-4 w-4" />
          </Button>
          
          {!isDefault && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                title={t('botBuilder.deleteIntent')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};