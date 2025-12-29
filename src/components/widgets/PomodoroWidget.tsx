import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

type TimerMode = 'work' | 'break' | 'longBreak';

export function PomodoroWidget() {
  const [settings, setSettings] = useStorage('pomodoroSettings');
  const [stats, setStats] = useStorage('pomodoroStats');
  const { useLightText } = useSettings();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize time when settings load
  useEffect(() => {
    if (settings) {
      setTimeLeft(settings.workDuration * 60);
    }
  }, [settings]);

  // Timer logic
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
    
    // Play sound
    if (settings?.soundEnabled) {
      playNotificationSound();
    }

    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      // Update stats
      if (stats) {
        const today = new Date().toDateString();
        await setStats({
          totalSessions: stats.totalSessions + 1,
          todaySessions: stats.lastSessionDate === today ? stats.todaySessions + 1 : 1,
          lastSessionDate: today,
        });
      }

      // Determine next break type
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
    // Create a simple beep using Web Audio API
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
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-gray-600';

  const modeColors = {
    work: textColorClass,
    break: 'text-green-400',
    longBreak: 'text-blue-400',
  };

  const modeLabels = {
    work: 'Focus Time',
    break: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="w-4 h-4" />
          <span className="text-sm font-medium">Pomodoro</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSound}>
            {settings?.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 glass" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Work Duration: {settings?.workDuration || 25}m</label>
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
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Break Duration: {settings?.breakDuration || 5}m</label>
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
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Long Break: {settings?.longBreakDuration || 15}m</label>
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
                    className="mt-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mode indicator */}
      <div className="text-center mb-2">
        <span className={cn('text-sm font-medium', modeColors[mode])}>
          {modeLabels[mode]}
        </span>
      </div>

      {/* Timer display with progress ring */}
      <div className="relative flex items-center justify-center mb-4">
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            className={cn('transition-all duration-1000', modeColors[mode])}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className={cn('absolute text-3xl font-mono font-bold', textColorClass)}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mb-3">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="h-10 w-10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          onClick={toggleTimer}
          className={cn('h-10 w-10', isRunning && 'glow')}
        >
          {isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-muted-foreground">
        <span>Sessions today: {stats?.todaySessions || 0}</span>
        <span className="mx-2">•</span>
        <span>Total: {stats?.totalSessions || 0}</span>
      </div>
    </div>
  );
}
