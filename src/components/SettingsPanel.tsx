import { useState } from 'react';
import { Settings, Sun, Moon, Monitor, Palette, Type, Layout, X, Cloud, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { useStorage } from '@/hooks/useStorage';
import { fontOptions, allFonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const gradientPresets = [
  // Dark Themes
  { name: 'Midnight', start: '#0f0c29', end: '#302b63' },
  { name: 'Ocean Deep', start: '#141E30', end: '#243B55' },
  { name: 'Aurora', start: '#1a1a2e', end: '#16213e' },
  { name: 'Berry', start: '#2d1f3d', end: '#614385' },
  // Sunset & Warm
  { name: 'Sunset', start: '#ff6b6b', end: '#feca57' },
  { name: 'Dusk', start: '#2b1055', end: '#7597de' },
  { name: 'Rose Gold', start: '#f093fb', end: '#f5576c' },
  { name: 'Peach', start: '#ee9ca7', end: '#ffdde1' },
  // Ocean & Cool
  { name: 'Ocean', start: '#0077b6', end: '#00b4d8' },
  { name: 'Teal Wave', start: '#11998e', end: '#38ef7d' },
  { name: 'Arctic', start: '#74ebd5', end: '#9face6' },
  { name: 'Sky Blue', start: '#a8edea', end: '#fed6e3' },
  // Nature
  { name: 'Forest', start: '#0d3331', end: '#1d976c' },
  { name: 'Emerald', start: '#134e5e', end: '#71b280' },
  { name: 'Spring', start: '#00b09b', end: '#96c93d' },
  { name: 'Lavender', start: '#e0c3fc', end: '#8ec5fc' },
  // Modern & Vibrant
  { name: 'Neon', start: '#fc466b', end: '#3f5efb' },
  { name: 'Electric', start: '#4776e6', end: '#8e54e9' },
  { name: 'Candy', start: '#ff9a9e', end: '#fecfef' },
  { name: 'Cosmic', start: '#667eea', end: '#764ba2' },
];

export function SettingsPanel() {
  const {
    theme,
    setTheme,
    fontSettings,
    setFontSettings,
    backgroundSettings,
    setBackgroundSettings,
    widgetLayout,
    setWidgetLayout,
    dragEnabled,
    setDragEnabled,
    compactMode,
    setCompactMode,
  } = useSettings();

  const [weatherSettings, setWeatherSettings] = useStorage('weatherSettings');
  const [open, setOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const updateFontSetting = async (key: string, value: string) => {
    if (fontSettings) {
      await setFontSettings({ ...fontSettings, [key]: value });
    }
  };

  const updateBackgroundSetting = async (key: string, value: any) => {
    if (backgroundSettings) {
      await setBackgroundSettings({ ...backgroundSettings, [key]: value });
    }
  };

  const toggleWidget = async (widgetKey: string) => {
    if (widgetLayout) {
      const widget = widgetLayout[widgetKey as keyof typeof widgetLayout];
      await setWidgetLayout({
        ...widgetLayout,
        [widgetKey]: { ...widget, visible: !widget.visible },
      });
    }
  };

  const saveWeatherApiKey = async () => {
    if (!tempApiKey.trim() || !weatherSettings) return;
    
    await setWeatherSettings({
      ...weatherSettings,
      apiKey: tempApiKey.trim(),
    });
    setTempApiKey('');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full glass hover:scale-105 transition-transform z-50"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Settings</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="appearance" className="mt-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="appearance" className="text-xs">
              <Palette className="w-4 h-4 mr-1" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="background" className="text-xs">
              <Sun className="w-4 h-4 mr-1" />
              Background
            </TabsTrigger>
            <TabsTrigger value="fonts" className="text-xs">
              <Type className="w-4 h-4 mr-1" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="weather" className="text-xs">
              <CloudSun className="w-4 h-4 mr-1" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-xs">
              <Layout className="w-4 h-4 mr-1" />
              Widgets
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Color Mode</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
                      'border border-border/50 hover:border-primary/50',
                      theme === value && 'bg-primary/10 border-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Background Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {['gradient', 'solid', 'unsplash'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateBackgroundSetting('type', type)}
                    className={cn(
                      'p-3 rounded-xl border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      backgroundSettings?.type === type && 'bg-primary/10 border-primary'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {backgroundSettings?.type === 'gradient' && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Gradient Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gradientPresets.map((preset) => {
                    const isSelected = 
                      backgroundSettings?.gradientStart === preset.start && 
                      backgroundSettings?.gradientEnd === preset.end;
                    
                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          updateBackgroundSetting('gradientStart', preset.start);
                          updateBackgroundSetting('gradientEnd', preset.end);
                        }}
                        className={cn(
                          "group relative h-16 rounded-lg overflow-hidden transition-all",
                          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${preset.start}, ${preset.end})`,
                        }}
                      >
                        <span className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity text-xs text-white font-medium",
                          isSelected ? "bg-black/40" : "bg-black/30 opacity-0 group-hover:opacity-100"
                        )}>
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block">Start Color</Label>
                    <Input
                      type="color"
                      value={backgroundSettings?.gradientStart || '#0f0c29'}
                      onChange={(e) => updateBackgroundSetting('gradientStart', e.target.value)}
                      className="w-full h-10 p-1 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">End Color</Label>
                    <Input
                      type="color"
                      value={backgroundSettings?.gradientEnd || '#302b63'}
                      onChange={(e) => updateBackgroundSetting('gradientEnd', e.target.value)}
                      className="w-full h-10 p-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {backgroundSettings?.type === 'solid' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Solid Color</Label>
                <Input
                  type="color"
                  value={backgroundSettings?.solidColor || '#1a1a2e'}
                  onChange={(e) => updateBackgroundSetting('solidColor', e.target.value)}
                  className="w-full h-12 p-1 cursor-pointer"
                />
              </div>
            )}

            {backgroundSettings?.type === 'unsplash' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Query</Label>
                <Input
                  placeholder="nature, landscape, abstract..."
                  value={backgroundSettings?.unsplashQuery || ''}
                  onChange={(e) => updateBackgroundSetting('unsplashQuery', e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Images refresh daily from Unsplash
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Blur: {backgroundSettings?.blur || 0}px
              </Label>
              <Slider
                value={[backgroundSettings?.blur || 0]}
                onValueChange={([value]) => updateBackgroundSetting('blur', value)}
                max={20}
                step={1}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Overlay Opacity: {backgroundSettings?.opacity || 100}%
              </Label>
              <Slider
                value={[backgroundSettings?.opacity || 100]}
                onValueChange={([value]) => updateBackgroundSetting('opacity', value)}
                max={100}
                step={5}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Text Color</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'auto', label: 'Auto' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateBackgroundSetting('textColor', value)}
                    className={cn(
                      'p-3 rounded-xl border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      backgroundSettings?.textColor === value && 'bg-primary/10 border-primary'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Auto adjusts based on background brightness
              </p>
            </div>
          </TabsContent>

          {/* Fonts Tab */}
          <TabsContent value="fonts" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Heading Font</Label>
              <Select
                value={fontSettings?.headingFont || 'Space Grotesk'}
                onValueChange={(value) => updateFontSetting('headingFont', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Body Font</Label>
              <Select
                value={fontSettings?.bodyFont || 'Inter'}
                onValueChange={(value) => updateFontSetting('bodyFont', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Monospace Font</Label>
              <Select
                value={fontSettings?.monoFont || 'JetBrains Mono'}
                onValueChange={(value) => updateFontSetting('monoFont', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.mono.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Font Scale</Label>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => updateFontSetting('scale', scale)}
                    className={cn(
                      'p-2 rounded-lg border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      fontSettings?.scale === scale && 'bg-primary/10 border-primary'
                    )}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Font Weight</Label>
              <div className="grid grid-cols-4 gap-2">
                {['light', 'regular', 'medium', 'bold'].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => updateFontSetting('weight', weight)}
                    className={cn(
                      'p-2 rounded-lg border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      fontSettings?.weight === weight && 'bg-primary/10 border-primary'
                    )}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Preview */}
            <div className="p-4 rounded-xl bg-background/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <h3 className="text-2xl font-heading mb-2">Heading Font</h3>
              <p className="font-body mb-2">This is body text to preview your font selection.</p>
              <code className="font-mono text-sm">const code = "monospace";</code>
            </div>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">API Configuration</Label>
              <div className="p-4 rounded-lg bg-background/30 border border-border/50 space-y-3">
                <div>
                  <Label htmlFor="weather-api-key" className="text-sm mb-2 block">
                    OpenWeatherMap API Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="weather-api-key"
                      type="password"
                      placeholder={weatherSettings?.apiKey ? '••••••••••••' : 'Enter API key'}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="bg-background/50"
                      onKeyDown={(e) => e.key === 'Enter' && saveWeatherApiKey()}
                    />
                    <Button onClick={saveWeatherApiKey} size="sm" disabled={!tempApiKey.trim()}>
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Get a free API key at{' '}
                    <a
                      href="https://openweathermap.org/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      openweathermap.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Cloud className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">About Weather Widget</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The weather widget displays current conditions and forecasts for your locations.
                    Locations can be managed directly from the widget settings.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Data is cached for 10 minutes to minimize API calls and improve performance.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="space-y-4 mt-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div>
                  <Label className="font-medium">Enable Widget Dragging</Label>
                  <p className="text-xs text-muted-foreground mt-1">Drag widgets to reorder them</p>
                </div>
                <Switch
                  checked={dragEnabled}
                  onCheckedChange={setDragEnabled}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
                <div>
                  <Label className="font-medium">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground mt-1">Smaller widgets to fit more on screen</p>
                </div>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">Toggle widgets visibility</p>
            {widgetLayout &&
              Object.entries(widgetLayout).map(([key, config]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/30"
                >
                  <Label className="capitalize">{key}</Label>
                  <Switch
                    checked={config.visible}
                    onCheckedChange={() => toggleWidget(key)}
                  />
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
