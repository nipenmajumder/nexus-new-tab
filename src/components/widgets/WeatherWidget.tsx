import { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, MapPin, Settings, Loader2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStorage } from '@/hooks/useStorage';
import { WeatherSettings } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  forecast?: ForecastDay[];
}

interface ForecastDay {
  date: string;
  temp: number;
  icon: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
  '01d': <Sun className="w-12 h-12 text-yellow-400" />,
  '01n': <Sun className="w-12 h-12 text-yellow-300" />,
  '02d': <Cloud className="w-12 h-12 text-gray-400" />,
  '02n': <Cloud className="w-12 h-12 text-gray-500" />,
  '03d': <Cloud className="w-12 h-12 text-gray-400" />,
  '03n': <Cloud className="w-12 h-12 text-gray-500" />,
  '04d': <Cloud className="w-12 h-12 text-gray-500" />,
  '04n': <Cloud className="w-12 h-12 text-gray-600" />,
  '09d': <CloudRain className="w-12 h-12 text-blue-400" />,
  '09n': <CloudRain className="w-12 h-12 text-blue-500" />,
  '10d': <CloudRain className="w-12 h-12 text-blue-400" />,
  '10n': <CloudRain className="w-12 h-12 text-blue-500" />,
  '13d': <CloudSnow className="w-12 h-12 text-blue-200" />,
  '13n': <CloudSnow className="w-12 h-12 text-blue-300" />,
  default: <Cloud className="w-12 h-12 text-gray-400" />,
};

export function WeatherWidget() {
  const [settings, setSettings] = useStorage('weatherSettings');
  const [weatherCache, setWeatherCache] = useStorage('weatherCache');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Migrate old settings structure to new one
  useEffect(() => {
    if (settings && !settings.locations) {
      // Old structure: settings.location (string)
      // New structure: settings.locations (array)
      const oldSettings = settings as WeatherSettings & { location?: string };
      const oldLocation = oldSettings.location;
      if (oldLocation) {
        setSettings({
          ...settings,
          locations: [oldLocation],
          currentLocationIndex: 0,
        });
      } else {
        setSettings({
          ...settings,
          locations: [],
          currentLocationIndex: 0,
        });
      }
    }
  }, [settings, setSettings]);

  const currentLocation = settings?.locations?.[settings?.currentLocationIndex ?? 0] || '';

  const getCacheKey = (location: string, units: 'metric' | 'imperial') => {
    return `${location}_${units}`;
  };

  const fetchWeather = useCallback(async (location: string, units: 'metric' | 'imperial', apiKey: string) => {
    if (!apiKey || !location) return;

    setLoading(true);
    setError(null);

    try {
      // Current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          location
        )}&units=${units}&appid=${apiKey}`
      );

      if (!currentRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentRes.json();

      // 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          location
        )}&units=${units}&appid=${apiKey}`
      );

      let forecast: ForecastDay[] = [];
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        // Get one reading per day (noon)
        const dailyData = forecastData.list.filter((_item: unknown, index: number) => index % 8 === 0);
        forecast = dailyData.slice(0, 5).map((day: { dt: number; main: { temp: number }; weather: Array<{ icon: string }> }) => ({
          date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.main.temp),
          icon: day.weather[0].icon,
        }));
      }

      const weatherData = {
        temp: Math.round(currentData.main.temp),
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed),
        city: currentData.name,
        forecast,
      };

      setWeather(weatherData);

      // Cache the weather data
      const cacheKey = getCacheKey(location, units);
      await setWeatherCache({
        ...weatherCache,
        [cacheKey]: {
          data: weatherData,
          timestamp: Date.now(),
          units,
        }
      });
    } catch (err) {
      setError('Failed to load weather. Check your API key and location.');
    } finally {
      setLoading(false);
    }
  }, [weatherCache, setWeatherCache]);

  useEffect(() => {
    if (settings?.apiKey && currentLocation) {
      const cacheKey = getCacheKey(currentLocation, settings.units);
      const cached = weatherCache?.[cacheKey];

      // Check if we have valid cached data
      if (cached?.data && cached?.timestamp) {
        const cacheAge = Date.now() - cached.timestamp;
        const isSameUnits = cached.units === settings.units;
        
        if (cacheAge < CACHE_DURATION && isSameUnits) {
          // Use cached data
          setWeather(cached.data);
          setError(null);
          return;
        }
      }
      
      // Fetch fresh data if cache is invalid or missing
      fetchWeather(currentLocation, settings.units, settings.apiKey);
    }
  }, [settings?.apiKey, currentLocation, settings?.units, weatherCache, CACHE_DURATION, fetchWeather]);

  const toggleUnits = async () => {
    if (settings) {
      const newUnits = settings.units === 'metric' ? 'imperial' : 'metric';
      await setSettings({ ...settings, units: newUnits });
    }
  };

  const switchLocation = async (direction: 'prev' | 'next') => {
    if (!settings || !Array.isArray(settings.locations) || !settings.locations.length) return;
    
    const currentIndex = settings.currentLocationIndex;
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % settings.locations.length;
    } else {
      newIndex = currentIndex === 0 ? settings.locations.length - 1 : currentIndex - 1;
    }
    
    await setSettings({ ...settings, currentLocationIndex: newIndex });
  };

  const addLocation = async () => {
    if (!newLocation.trim() || !settings) return;
    
    const existingLocations = Array.isArray(settings.locations) ? settings.locations : [];
    
    await setSettings({
      ...settings,
      locations: [...existingLocations, newLocation.trim()],
    });
    setNewLocation('');
  };

  const removeLocation = async (index: number) => {
    if (!settings || !Array.isArray(settings.locations) || settings.locations.length <= 1) return;
    
    const newLocations = settings.locations.filter((_, i) => i !== index);
    const newIndex = settings.currentLocationIndex >= newLocations.length 
      ? newLocations.length - 1 
      : settings.currentLocationIndex;
    
    await setSettings({
      ...settings,
      locations: newLocations,
      currentLocationIndex: newIndex,
    });
  };

  const saveApiKey = async () => {
    if (!tempApiKey.trim() || !settings) return;
    
    await setSettings({
      ...settings,
      apiKey: tempApiKey.trim(),
    });
    setShowSettings(false);
  };

  const getWeatherIcon = (iconCode: string) => {
    return weatherIcons[iconCode] || weatherIcons.default;
  };

  const needsSetup = !settings?.apiKey || !settings?.locations?.length;
  const hasMultipleLocations = (settings?.locations?.length ?? 0) > 1;

  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cloud className="w-4 h-4" />
          <span className="text-sm font-medium">Weather</span>
        </div>
        <div className="flex items-center gap-1">
          {!needsSetup && (
            <div className="flex items-center gap-1 mr-1">
              <Label className="text-xs text-muted-foreground">
                {settings?.units === 'metric' ? '°C' : '°F'}
              </Label>
              <Switch
                checked={settings?.units === 'imperial'}
                onCheckedChange={toggleUnits}
                className="scale-75"
              />
            </div>
          )}
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">OpenWeatherMap API Key</label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter API key"
                      defaultValue={settings?.apiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button onClick={saveApiKey} size="sm">
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get free key at{' '}
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
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Locations</label>
                  <div className="space-y-2 mb-2">
                    {settings?.locations?.map((loc, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 rounded bg-background/50">
                        <span className={cn(
                          "text-sm flex-1",
                          index === settings.currentLocationIndex && "font-medium text-primary"
                        )}>
                          {loc}
                        </span>
                        <div className="flex gap-1">
                          {index === settings.currentLocationIndex && (
                            <span className="text-xs text-primary">Active</span>
                          )}
                          {settings.locations.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeLocation(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add city name"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                      className="bg-background/50"
                    />
                    <Button onClick={addLocation} size="icon" disabled={!newLocation.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {needsSetup ? (
        <div className="text-center py-6">
          <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-2">Set up weather</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            Configure
          </Button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            Check Settings
          </Button>
        </div>
      ) : weather ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                {hasMultipleLocations && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => switchLocation('prev')}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                  </>
                )}
                <MapPin className="w-3 h-3" />
                <span>{weather.city}</span>
                {hasMultipleLocations && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => switchLocation('next')}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="text-5xl font-heading font-bold">
                {weather.temp}°
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </p>
            </div>
            <div>{getWeatherIcon(weather.icon)}</div>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              {weather.humidity}%
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              {weather.windSpeed} {settings?.units === 'metric' ? 'm/s' : 'mph'}
            </div>
          </div>

          {weather.forecast && weather.forecast.length > 0 && (
            <div className="border-t border-border/50 pt-3">
              <div className="grid grid-cols-5 gap-2 text-center">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="text-xs">
                    <div className="text-muted-foreground mb-1">{day.date}</div>
                    <div className="text-lg font-medium">{day.temp}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
