import { cn } from '@/lib/utils';

interface VoiceAnimationProps {
  language: 'en' | 'sw' | 'ar';
  style?: 'orb' | 'waveform' | 'dots' | 'siri';
  isActive?: boolean;
}

export const VoiceAnimation = ({ language, style = 'waveform', isActive = true }: VoiceAnimationProps) => {
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

  if (style === 'siri') {
    return (
      <div className="flex items-center justify-center h-24 w-full">
        <svg width="200" height="80" viewBox="0 0 200 80" className="overflow-visible">
          <defs>
            <linearGradient id={`siri-gradient-${language}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: color, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.6 }} />
            </linearGradient>
            <filter id={`siri-glow-${language}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {[...Array(5)].map((_, i) => (
            <path
              key={i}
              d={`M 0,40 Q 50,${20 + i * 5} 100,40 T 200,40`}
              fill="none"
              stroke={`url(#siri-gradient-${language})`}
              strokeWidth="3"
              strokeLinecap="round"
              filter={`url(#siri-glow-${language})`}
              opacity={1 - i * 0.15}
              style={{
                animation: `siriWave ${1.5 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </svg>
        <style>{`
          @keyframes siriWave {
            0%, 100% { 
              d: path('M 0,40 Q 50,20 100,40 T 200,40');
            }
            50% { 
              d: path('M 0,40 Q 50,60 100,40 T 200,40');
            }
          }
        `}</style>
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
