import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function Background() {
  const { backgroundSettings, setBackgroundSettings } = useSettings();
  const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (backgroundSettings?.type === 'unsplash') {
      // Check if we need a new image (daily refresh)
      const today = new Date().toDateString();
      
      if (backgroundSettings.lastUnsplashDate !== today || !backgroundSettings.lastUnsplashUrl) {
        // Fetch new image using Unsplash's random photo API
        const query = backgroundSettings.unsplashQuery || 'nature,landscape';
        const randomSeed = Date.now();
        // Use Unsplash API endpoint that supports CORS
        const url = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=${randomSeed % 100}`;
        
        // For random images based on query, we'll use a simple approach
        const width = window.innerWidth || 1920;
        const height = window.innerHeight || 1080;
        const finalUrl = `https://source.unsplash.com/random/${width}x${height}/?${encodeURIComponent(query)}`;
        
        setUnsplashUrl(finalUrl);
        setImageLoaded(true);
        
        // Save the URL and date to settings
        if (setBackgroundSettings) {
          setBackgroundSettings({
            ...backgroundSettings,
            lastUnsplashUrl: finalUrl,
            lastUnsplashDate: today,
          });
        }
      } else {
        // Use cached URL
        setUnsplashUrl(backgroundSettings.lastUnsplashUrl);
        setImageLoaded(true);
      }
    } else {
      setImageLoaded(true);
    }
  }, [backgroundSettings?.type, backgroundSettings?.unsplashQuery, backgroundSettings?.lastUnsplashDate]);

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
        if (unsplashUrl && imageLoaded) {
          style.backgroundImage = `url("${unsplashUrl}")`;
          style.backgroundRepeat = 'no-repeat';
        } else {
          // Fallback while loading or if image fails
          style.backgroundImage = 'linear-gradient(135deg, #667eea, #764ba2)';
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
