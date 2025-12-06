import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [timezones, setTimezones] = useStorage('timezones');
  const [showAddPopover, setShowAddPopover] = useState(false);
  const { clockSettings, setClockSettings, useLightText } = useSettings();

  const use24Hour = clockSettings?.use24Hour ?? true;

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

  const textColorClass = useLightText ? 'text-white' : 'text-foreground';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-muted-foreground';

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-header-left">
          <Clock className="widget-header-icon" />
          <span className="widget-title">Clock</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label className={cn("text-xs", mutedColorClass)}>24h</Label>
            <Switch
              checked={use24Hour}
              onCheckedChange={toggle24Hour}
              className="scale-75"
            />
          </div>
          <Popover open={showAddPopover} onOpenChange={setShowAddPopover}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10">
                <Plus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 glass" align="end">
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Add Timezone</p>
                {popularTimezones
                  .filter((tz) => !timezones?.includes(tz.zone))
                  .map((tz) => (
                    <Button
                      key={tz.zone}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm hover:bg-white/10"
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
        <motion.div 
          className={cn("text-6xl font-heading font-bold tracking-tight", textColorClass)}
          key={formatTime(time)}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(time)}
        </motion.div>
        {!use24Hour && (
          <div className={cn("text-lg font-medium mt-1", mutedColorClass)}>
            {format(time, 'a')}
          </div>
        )}
        <motion.div 
          className={cn("text-2xl font-light tabular-nums", mutedColorClass)}
          key={format(time, 'ss')}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0.7 }}
        >
          :{format(time, 'ss')}
        </motion.div>
        <div className={cn("text-sm mt-3 tracking-wide", mutedColorClass)}>
          {format(time, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Additional timezones */}
      <AnimatePresence>
        {timezones && timezones.filter((tz) => tz !== 'local').length > 0 && (
          <motion.div 
            className={cn(
              "border-t pt-4 mt-4 space-y-2",
              useLightText ? "border-white/20" : "border-border"
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {timezones
              .filter((tz) => tz !== 'local')
              .map((zone) => (
                <motion.div
                  key={zone}
                  className="flex items-center justify-between text-sm group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <span className={mutedColorClass}>{getTimezoneLabel(zone)}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono tabular-nums", textColorClass)}>
                      {getTimeInTimezone(zone)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTimezone(zone)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
