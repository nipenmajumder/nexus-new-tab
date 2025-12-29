import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { FontSettings, BackgroundSettings, WidgetLayout, ClockSettings } from '@/lib/storage';
import { loadFonts, applyFontSettings, initFonts } from '@/lib/fonts';

// Helper to determine if a color is light or dark
function getColorLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function shouldUseLight(bgSettings: BackgroundSettings | null): boolean {
  if (!bgSettings) return true;
  if (bgSettings.textColor === 'light') return true;
  if (bgSettings.textColor === 'dark') return false;
  
  // Auto detect based on background
  if (bgSettings.type === 'solid') {
    return getColorLuminance(bgSettings.solidColor) < 0.5;
  } else if (bgSettings.type === 'gradient') {
    const startLum = getColorLuminance(bgSettings.gradientStart);
    const endLum = getColorLuminance(bgSettings.gradientEnd);
    return (startLum + endLum) / 2 < 0.5;
  }
  return true; // Default to light text for unsplash
}

interface SettingsContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  fontSettings: FontSettings | null;
  setFontSettings: (settings: FontSettings) => Promise<void>;
  backgroundSettings: BackgroundSettings | null;
  setBackgroundSettings: (settings: BackgroundSettings) => Promise<void>;
  widgetLayout: WidgetLayout | null;
  setWidgetLayout: (layout: WidgetLayout) => Promise<void>;
  clockSettings: ClockSettings | null;
  setClockSettings: (settings: ClockSettings) => Promise<void>;
  dragEnabled: boolean;
  setDragEnabled: (enabled: boolean) => Promise<void>;
  useLightText: boolean;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeStorage] = useStorage('theme');
  const [fontSettings, setFontSettingsStorage, fontLoading] = useStorage('fontSettings');
  const [backgroundSettings, setBackgroundSettingsStorage, bgLoading] = useStorage('backgroundSettings');
  const [widgetLayout, setWidgetLayoutStorage, layoutLoading] = useStorage('widgetLayout');
  const [clockSettings, setClockSettingsStorage, clockLoading] = useStorage('clockSettings');
  const [dragEnabled, setDragEnabledStorage] = useStorage('dragEnabled');
  const [fontsInitialized, setFontsInitialized] = useState(false);
  
  const useLightText = shouldUseLight(backgroundSettings);

  // Initialize fonts
  useEffect(() => {
    initFonts().then(() => setFontsInitialized(true));
  }, []);

  // Apply theme
  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }
  }, [theme]);

  // Apply font settings
  useEffect(() => {
    if (fontSettings && fontsInitialized) {
      loadFonts([fontSettings.headingFont, fontSettings.bodyFont, fontSettings.monoFont])
        .then(() => applyFontSettings(fontSettings));
    }
  }, [fontSettings, fontsInitialized]);

  const setTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    await setThemeStorage(newTheme);
  };

  const setFontSettings = async (settings: FontSettings) => {
    await setFontSettingsStorage(settings);
  };

  const setBackgroundSettings = async (settings: BackgroundSettings) => {
    await setBackgroundSettingsStorage(settings);
  };

  const setWidgetLayout = async (layout: WidgetLayout) => {
    await setWidgetLayoutStorage(layout);
  };

  const setClockSettings = async (settings: ClockSettings) => {
    await setClockSettingsStorage(settings);
  };

  const setDragEnabled = async (enabled: boolean) => {
    await setDragEnabledStorage(enabled);
  };

  const isLoading = fontLoading || bgLoading || layoutLoading || clockLoading || !fontsInitialized;

  return (
    <SettingsContext.Provider
      value={{
        theme: theme ?? 'dark',
        setTheme,
        fontSettings,
        setFontSettings,
        backgroundSettings,
        setBackgroundSettings,
        widgetLayout,
        setWidgetLayout,
        clockSettings,
        setClockSettings,
        dragEnabled: dragEnabled ?? true,
        setDragEnabled,
        useLightText,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
