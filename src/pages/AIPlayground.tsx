import React from 'react';
import AppNavigation from '@/components/layout/AppNavigation';
import AIModelPlayground from '@/components/ai-playground/AIModelPlayground';
import { useLanguage } from '@/contexts/LanguageContext';

const AIPlayground = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <AppNavigation showBackButton={true} title={t('playground.title')} />
      <div className="container mx-auto px-4 py-8">
        <AIModelPlayground />
      </div>
    </div>
  );
};

export default AIPlayground;