import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Plus, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface TimezoneDisplay {
  zone: string;
  label: string;
}

const popularTimezones = [
  { zone: 'America/New_York', label: 'New York' },
  { zone: 'America/Los_Angeles', label: 'Los Angeles' },
  { zone: 'Europe/London', label: 'London' },
  { zone: 'Europe/Paris', label: 'Paris' },
  { zone: 'Asia/Tokyo', label: 'Tokyo' },
  { zone: 'Asia/Singapore', label: 'Singapore' },
  { zone: 'Australia/Sydney', label: 'Sydney' },
];

function AnalogClock({ time, useLightText }: { time: Date; useLightText: boolean }) {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondsDeg = (seconds / 60) * 360;
  const minutesDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hoursDeg = (hours / 12) * 360 + (minutes / 60) * 30;

  const strokeColor = useLightText ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const accentColor = useLightText ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Clock face */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 50 + 38 * Math.cos(angle);
          const y1 = 50 + 38 * Math.sin(angle);
          const x2 = 50 + 42 * Math.cos(angle);
          const y2 = 50 + 42 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Hour hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="25"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${hoursDeg}, 50, 50)`}
        />

        {/* Minute hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="18"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${minutesDeg}, 50, 50)`}
        />

        {/* Second hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${secondsDeg}, 50, 50)`}
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="3" fill={accentColor} />
      </svg>
    </div>
  );
}

export function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [timezones, setTimezones] = useStorage('timezones');
  const [showAddPopover, setShowAddPopover] = useState(false);
  const { clockSettings, setClockSettings, useLightText } = useSettings();

  const use24Hour = clockSettings?.use24Hour ?? true;
  const clockType = clockSettings?.clockType ?? 'digital';

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date, includeSeconds = false) => {
    if (use24Hour) {
      return includeSeconds ? format(date, 'HH:mm:ss') : format(date, 'HH:mm');
    }
    return includeSeconds ? format(date, 'hh:mm:ss a') : format(date, 'hh:mm');
  };

  const getTimeInTimezone = (timezone: string) => {
    try {
      if (timezone === 'local') {
        return formatTime(time, true);
      }
      return time.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: !use24Hour,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return formatTime(time, true);
    }
  };

  const addTimezone = async (tz: TimezoneDisplay) => {
    if (timezones && !timezones.includes(tz.zone)) {
      await setTimezones([...timezones, tz.zone]);
    }
    setShowAddPopover(false);
  };

  const removeTimezone = async (zone: string) => {
    if (timezones) {
      await setTimezones(timezones.filter((tz) => tz !== zone));
    }
  };

  const getTimezoneLabel = (zone: string) => {
    if (zone === 'local') return 'Local';
    const found = popularTimezones.find((tz) => tz.zone === zone);
    return found?.label || zone.split('/').pop()?.replace('_', ' ') || zone;
  };

  const toggle24Hour = async () => {
    if (clockSettings) {
      await setClockSettings({ ...clockSettings, use24Hour: !use24Hour });
    }
  };

  const toggleClockType = async () => {
    if (clockSettings) {
      await setClockSettings({ 
        ...clockSettings, 
        clockType: clockType === 'digital' ? 'analog' : 'digital' 
      });
    }
  };

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-gray-600';

  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("flex items-center gap-2", mutedColorClass)}>
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Clock</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Clock Type Toggle */}
          <div className="flex items-center gap-1.5">
            <Label className={cn("text-xs", mutedColorClass)}>
              {clockType === 'digital' ? 'Digital' : 'Analog'}
            </Label>
            <Switch
              checked={clockType === 'analog'}
              onCheckedChange={toggleClockType}
              className="scale-75"
            />
          </div>
          {/* 24h Toggle - only show for digital */}
          {clockType === 'digital' && (
            <div className="flex items-center gap-1.5">
              <Label className={cn("text-xs", mutedColorClass)}>24h</Label>
              <Switch
                checked={use24Hour}
                onCheckedChange={toggle24Hour}
                className="scale-75"
              />
            </div>
          )}
          <Popover open={showAddPopover} onOpenChange={setShowAddPopover}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 glass" align="end">
              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">Add Timezone</p>
                {popularTimezones
                  .filter((tz) => !timezones?.includes(tz.zone))
                  .map((tz) => (
                    <Button
                      key={tz.zone}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => addTimezone(tz)}
                    >
                      <Globe className="w-3 h-3 mr-2" />
                      {tz.label}
                    </Button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main local time */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
        {clockType === 'analog' ? (
          <>
            <AnalogClock time={time} useLightText={useLightText} />
            <div className={cn("text-sm mt-3", mutedColorClass)}>
              {format(time, 'EEEE, MMMM d, yyyy')}
            </div>
          </>
        ) : (
          <>
            <div className={cn("text-6xl font-heading font-bold tracking-tight", textColorClass)}>
              {formatTime(time)}
            </div>
            {!use24Hour && (
              <div className={cn("text-lg font-medium", mutedColorClass)}>
                {format(time, 'a')}
              </div>
            )}
            <div className={cn("text-2xl font-light", mutedColorClass)}>
              {format(time, 'ss')}
            </div>
            <div className={cn("text-sm mt-2", mutedColorClass)}>
              {format(time, 'EEEE, MMMM d, yyyy')}
            </div>
          </>
        )}
      </div>

      {/* Additional timezones */}
      {timezones && timezones.filter((tz) => tz !== 'local').length > 0 && (
        <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
          {timezones
            .filter((tz) => tz !== 'local')
            .map((zone) => (
              <div
                key={zone}
                className="flex items-center justify-between text-sm"
              >
                <span className={mutedColorClass}>{getTimezoneLabel(zone)}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono", textColorClass)}>{getTimeInTimezone(zone)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-50 hover:opacity-100"
                    onClick={() => removeTimezone(zone)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
