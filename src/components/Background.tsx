import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function Background() {
  const { backgroundSettings } = useSettings();
  const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);

  useEffect(() => {
    if (backgroundSettings?.type === 'unsplash') {
      // Check if we need a new image (daily refresh)
      const today = new Date().toDateString();
      if (backgroundSettings.lastUnsplashDate !== today || !backgroundSettings.lastUnsplashUrl) {
        const query = backgroundSettings.unsplashQuery || 'nature,landscape';
        // Use Unsplash source for random images
        const url = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(query)}&t=${Date.now()}`;
        setUnsplashUrl(url);
      } else {
        setUnsplashUrl(backgroundSettings.lastUnsplashUrl);
      }
    }
  }, [backgroundSettings?.type, backgroundSettings?.unsplashQuery]);

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!backgroundSettings) {
      return {
        backgroundImage: 'linear-gradient(135deg, #0f0c29, #302b63)',
      };
    }

    const { type, solidColor, gradientStart, gradientEnd, gradientAngle, blur } =
      backgroundSettings;

    const style: React.CSSProperties = {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: blur ? `blur(${blur}px)` : undefined,
    };

    switch (type) {
      case 'solid':
        style.backgroundColor = solidColor || '#1a1a2e';
        break;
      case 'gradient':
        style.backgroundImage = `linear-gradient(${gradientAngle || 135}deg, ${gradientStart || '#0f0c29'}, ${
          gradientEnd || '#302b63'
        })`;
        break;
      case 'unsplash':
        if (unsplashUrl) {
          style.backgroundImage = `url(${unsplashUrl})`;
        } else {
          style.backgroundImage = 'linear-gradient(135deg, #0f0c29, #302b63)';
        }
        break;
      default:
        style.backgroundImage = 'linear-gradient(135deg, #0f0c29, #302b63)';
    }

    return style;
  };

  const overlayOpacity = backgroundSettings?.opacity ? (100 - backgroundSettings.opacity) / 100 : 0;

  return (
    <>
      {/* Background layer */}
      <div
        className="fixed inset-0 -z-20 transition-all duration-700"
        style={getBackgroundStyle()}
      />
      
      {/* Overlay for opacity control */}
      <div
        className="fixed inset-0 -z-10 bg-background transition-opacity duration-500"
        style={{ opacity: overlayOpacity }}
      />
      
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 -z-5 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
