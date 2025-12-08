import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

type TimerMode = 'work' | 'break' | 'longBreak';

interface PomodoroWidgetProps {
  compact?: boolean;
}

export function PomodoroWidget({ compact = false }: PomodoroWidgetProps) {
  const [settings, setSettings] = useStorage('pomodoroSettings');
  const [stats, setStats] = useStorage('pomodoroStats');
  const { useLightText } = useSettings();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    if (settings) {
      setTimeLeft(settings.workDuration * 60);
    }
  }, [settings]);

  useEffect(() => {
    if (!isRunning || !settings) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, settings, mode]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (settings?.soundEnabled) {
      playNotificationSound();
    }

    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      if (stats) {
        const today = new Date().toDateString();
        await setStats({
          totalSessions: stats.totalSessions + 1,
          todaySessions: stats.lastSessionDate === today ? stats.todaySessions + 1 : 1,
          lastSessionDate: today,
        });
      }

      if (settings && newSessions % settings.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('break');
        setTimeLeft(settings!.breakDuration * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(settings!.workDuration * 60);
    }
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(settings?.workDuration ? settings.workDuration * 60 : 25 * 60);
  };

  const toggleSound = async () => {
    if (settings) {
      await setSettings({ ...settings, soundEnabled: !settings.soundEnabled });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDuration = () => {
    if (!settings) return 25 * 60;
    switch (mode) {
      case 'work': return settings.workDuration * 60;
      case 'break': return settings.breakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  };

  const progress = ((getDuration() - timeLeft) / getDuration()) * 100;
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const textColorClass = useLightText ? 'text-white' : 'text-foreground';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-muted-foreground';

  const modeConfig = {
    work: { color: 'text-primary', bg: 'bg-primary/20', stroke: 'stroke-primary' },
    break: { color: 'text-green-400', bg: 'bg-green-500/20', stroke: 'stroke-green-400' },
    longBreak: { color: 'text-blue-400', bg: 'bg-blue-500/20', stroke: 'stroke-blue-400' },
  };

  const modeLabels = {
    work: 'Focus Time',
    break: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <div className={compact ? 'widget-compact' : 'widget'}>
      <div className="widget-header">
        <div className="widget-header-left">
          <Timer className="widget-header-icon" />
          <span className="widget-title">Pomodoro</span>
        </div>
        {!compact && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10" onClick={toggleSound}>
              {settings?.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 glass" align="end">
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Work: {settings?.workDuration || 25}m</label>
                    <Slider
                      value={[settings?.workDuration || 25]}
                      onValueChange={async ([value]) => {
                        if (settings) {
                          await setSettings({ ...settings, workDuration: value });
                          if (mode === 'work' && !isRunning) {
                            setTimeLeft(value * 60);
                          }
                        }
                      }}
                      min={5}
                      max={60}
                      step={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Break: {settings?.breakDuration || 5}m</label>
                    <Slider
                      value={[settings?.breakDuration || 5]}
                      onValueChange={async ([value]) => {
                        if (settings) {
                          await setSettings({ ...settings, breakDuration: value });
                        }
                      }}
                      min={1}
                      max={15}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Long Break: {settings?.longBreakDuration || 15}m</label>
                    <Slider
                      value={[settings?.longBreakDuration || 15]}
                      onValueChange={async ([value]) => {
                        if (settings) {
                          await setSettings({ ...settings, longBreakDuration: value });
                        }
                      }}
                      min={10}
                      max={30}
                      step={5}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Mode indicator */}
      <motion.div 
        className={cn("text-center", compact ? "mb-1" : "mb-3")}
        key={mode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className={cn(
          'font-medium px-3 py-1 rounded-full',
          modeConfig[mode].bg,
          modeConfig[mode].color,
          compact ? "text-xs" : "text-sm"
        )}>
          {modeLabels[mode]}
        </span>
      </motion.div>

      {/* Timer display with progress ring */}
      <div className={cn("relative flex items-center justify-center flex-1", compact ? "mb-2" : "mb-5")}>
        <svg className={compact ? "w-20 h-20 -rotate-90" : "w-36 h-36 -rotate-90"}>
          <circle
            cx={compact ? "40" : "72"}
            cy={compact ? "40" : "72"}
            r={compact ? "30" : "50"}
            stroke="currentColor"
            strokeWidth={compact ? "4" : "6"}
            fill="none"
            className="text-muted/20"
          />
          <motion.circle
            cx={compact ? "40" : "72"}
            cy={compact ? "40" : "72"}
            r={compact ? "30" : "50"}
            strokeWidth={compact ? "4" : "6"}
            fill="none"
            strokeLinecap="round"
            className={cn('transition-colors duration-300', modeConfig[mode].stroke)}
            style={{
              strokeDasharray: compact ? 2 * Math.PI * 30 : circumference,
              strokeDashoffset: compact ? (2 * Math.PI * 30) - (progress / 100) * (2 * Math.PI * 30) : strokeDashoffset,
            }}
            initial={false}
            animate={{ strokeDashoffset: compact ? (2 * Math.PI * 30) - (progress / 100) * (2 * Math.PI * 30) : strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        <motion.div 
          className={cn(
            'absolute font-mono font-bold tabular-nums',
            textColorClass,
            compact ? "text-lg" : "text-4xl"
          )}
          key={formatTime(timeLeft)}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>

      {/* Controls */}
      <div className={cn("flex justify-center gap-2", compact ? "" : "mb-4")}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className={compact ? "h-8 w-8 rounded-full" : "h-11 w-11 rounded-full"}
          >
            <RotateCcw className={compact ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            onClick={toggleTimer}
            className={cn(
              'rounded-full transition-shadow',
              isRunning && 'animate-glow-pulse',
              compact ? "h-8 w-8" : "h-11 w-11"
            )}
          >
            {isRunning ? (
              <Pause className={compact ? "w-3 h-3" : "w-5 h-5"} />
            ) : (
              <Play className={cn(compact ? "w-3 h-3" : "w-5 h-5", "ml-0.5")} />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Stats - hidden in compact mode */}
      {!compact && (
        <div className={cn("text-center text-sm", mutedColorClass)}>
          <span>Today: <strong className={textColorClass}>{stats?.todaySessions || 0}</strong></span>
          <span className="mx-3 opacity-50">•</span>
          <span>Total: <strong className={textColorClass}>{stats?.totalSessions || 0}</strong></span>
        </div>
      )}
    </div>
  );
}
