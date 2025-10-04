import { cn } from '@/lib/utils';

interface VoiceAnimationProps {
  language: 'en' | 'sw' | 'ar';
  style?: 'orb' | 'waveform' | 'dots';
}

export const VoiceAnimation = ({ language, style = 'waveform' }: VoiceAnimationProps) => {
  // Language-based colors
  const colorMap = {
    en: 'hsl(var(--primary))', // Blue for English
    sw: 'hsl(142, 76%, 36%)', // Green for Swahili
    ar: 'hsl(43, 74%, 49%)' // Gold for Arabic
  };

  const color = colorMap[language];

  if (style === 'orb') {
    return (
      <div className="flex items-center justify-center h-16">
        <div
          className="rounded-full animate-pulse shadow-lg"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}`,
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      </div>
    );
  }

  if (style === 'dots') {
    return (
      <div className="flex items-center justify-center gap-2 h-12">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-bounce"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 200}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  }

  // Default: waveform
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            backgroundColor: color,
            height: `${16 + Math.sin(i * 0.5) * 12}px`,
            animation: `waveform 0.8s ease-in-out infinite`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0%, 100% { 
            transform: scaleY(0.5);
            opacity: 0.6;
          }
          50% { 
            transform: scaleY(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
