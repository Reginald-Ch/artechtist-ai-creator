import React from 'react';
import AppNavigation from '@/components/layout/AppNavigation';
import EnhancedVoiceTraining from '@/components/voice-training/EnhancedVoiceTraining';

const VoiceTraining = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <AppNavigation showBackButton={true} title="Voice Training Studio" />
      <div className="container mx-auto px-4 py-8">
        <EnhancedVoiceTraining />
      </div>
    </div>
  );
};

export default VoiceTraining;