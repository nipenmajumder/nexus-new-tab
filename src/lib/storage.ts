// Chrome Storage API wrapper with fallback for development
// Uses chrome.storage.local when available, otherwise falls back to a mock for dev

declare const chrome: {
  storage: {
    local: {
      get: (keys: string | string[] | null, callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback: () => void) => void;
      clear: (callback: () => void) => void;
    };
  };
} | undefined;

export interface StorageData {
  todos: Todo[];
  quickLinks: QuickLink[];
  notes: string;
  pomodoroSettings: PomodoroSettings;
  pomodoroStats: PomodoroStats;
  widgetLayout: WidgetLayout;
  backgroundSettings: BackgroundSettings;
  fontSettings: FontSettings;
  weatherSettings: WeatherSettings;
  weatherCache: WeatherCache;
  timezones: string[];
  theme: 'light' | 'dark' | 'system';
  clockSettings: ClockSettings;
  googleApps: GoogleApp[];
  aiTools: AITool[];
  musicServices: MusicService[];
  defaultMusicService: 'spotify' | 'youtube';
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  createdAt: number;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  order: number;
}

export interface GoogleApp {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

export interface AITool {
  id: string;
  name: string;
  url: string;
  icon: string;
  color?: string;
  order: number;
}

export interface MusicService {
  name: 'spotify' | 'youtube';
  links: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

export interface PomodoroStats {
  totalSessions: number;
  todaySessions: number;
  lastSessionDate: string;
}

export interface WidgetLayout {
  clock: { visible: boolean; order: number };
  weather: { visible: boolean; order: number };
  todos: { visible: boolean; order: number };
  pomodoro: { visible: boolean; order: number };
  notes: { visible: boolean; order: number };
  quickLinks: { visible: boolean; order: number };
  googleApps: { visible: boolean; order: number };
  aiTools: { visible: boolean; order: number };
  music: { visible: boolean; order: number };
  search: { visible: boolean; order: number };
}

export interface BackgroundSettings {
  type: 'unsplash' | 'solid' | 'gradient';
  unsplashQuery: string;
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  blur: number;
  opacity: number;
  lastUnsplashUrl?: string;
  lastUnsplashDate?: string;
  textColor: 'auto' | 'light' | 'dark';
}

export interface ClockSettings {
  use24Hour: boolean;
}

export interface FontSettings {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  scale: 'small' | 'medium' | 'large';
  weight: 'light' | 'regular' | 'medium' | 'bold';
}

export interface WeatherSettings {
  apiKey: string;
  locations: string[];
  currentLocationIndex: number;
  units: 'metric' | 'imperial';
}

export interface WeatherCache {
  [key: string]: {
    data: {
      temp: number;
      description: string;
      icon: string;
      humidity: number;
      windSpeed: number;
      city: string;
      forecast?: Array<{
        date: string;
        temp: number;
        icon: string;
      }>;
    };
    timestamp: number;
    units: 'metric' | 'imperial';
  };
}

const defaultData: StorageData = {
  todos: [],
  quickLinks: [
    { id: '1', title: 'Google', url: 'https://google.com', order: 0 },
    { id: '2', title: 'GitHub', url: 'https://github.com', order: 1 },
    { id: '3', title: 'YouTube', url: 'https://youtube.com', order: 2 },
  ],
  notes: '',
  pomodoroSettings: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  },
  pomodoroStats: {
    totalSessions: 0,
    todaySessions: 0,
    lastSessionDate: '',
  },
  widgetLayout: {
    clock: { visible: true, order: 0 },
    weather: { visible: true, order: 1 },
    todos: { visible: true, order: 2 },
    pomodoro: { visible: true, order: 3 },
    notes: { visible: true, order: 4 },
    quickLinks: { visible: true, order: 5 },
    googleApps: { visible: true, order: 6 },
    aiTools: { visible: true, order: 7 },
    music: { visible: true, order: 8 },
    search: { visible: true, order: 9 },
  },
  backgroundSettings: {
    type: 'gradient',
    unsplashQuery: 'nature,landscape',
    solidColor: '#1a1a2e',
    gradientStart: '#0f0c29',
    gradientEnd: '#302b63',
    gradientAngle: 135,
    blur: 0,
    opacity: 100,
    textColor: 'auto',
  },
  clockSettings: {
    use24Hour: true,
  },
  fontSettings: {
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    scale: 'medium',
    weight: 'regular',
  },
  weatherSettings: {
    apiKey: '',
    locations: [],
    currentLocationIndex: 0,
    units: 'metric',
  },
  weatherCache: {},
  timezones: ['local'],
  theme: 'dark',
  googleApps: [
    { id: '1', name: 'Gmail', url: 'https://mail.google.com', icon: 'https://www.google.com/gmail/about/static-2.0/images/logo-gmail.png', order: 0 },
    { id: '2', name: 'Drive', url: 'https://drive.google.com', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png', order: 1 },
    { id: '3', name: 'Calendar', url: 'https://calendar.google.com', icon: 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_11.ico', order: 2 },
    { id: '4', name: 'Photos', url: 'https://photos.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/photos_48dp.png', order: 3 },
    { id: '5', name: 'Maps', url: 'https://maps.google.com', icon: 'https://www.google.com/images/branding/product/1x/maps_48dp.png', order: 4 },
    { id: '6', name: 'Docs', url: 'https://docs.google.com', icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico', order: 5 },
    { id: '7', name: 'Sheets', url: 'https://sheets.google.com', icon: 'https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico', order: 6 },
    { id: '8', name: 'Meet', url: 'https://meet.google.com', icon: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-48dp/logo_meet_2020q4_color_1x_web_48dp.png', order: 7 },
  ],
  aiTools: [
    { id: '1', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://chat.openai.com/favicon.ico', color: '#10a37f', order: 0 },
    { id: '2', name: 'Claude', url: 'https://claude.ai', icon: 'https://claude.ai/favicon.ico', color: '#d97757', order: 1 },
    { id: '3', name: 'Gemini', url: 'https://gemini.google.com', icon: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png', color: '#4285f4', order: 2 },
    { id: '4', name: 'Perplexity', url: 'https://perplexity.ai', icon: 'https://www.perplexity.ai/favicon.svg', color: '#20808d', order: 3 },
    { id: '5', name: 'Midjourney', url: 'https://www.midjourney.com', icon: 'https://www.midjourney.com/favicon.ico', color: '#000000', order: 4 },
    { id: '6', name: 'HuggingFace', url: 'https://huggingface.co', icon: 'https://huggingface.co/favicon.ico', color: '#ff9d00', order: 5 },
  ],
  musicServices: [
    {
      name: 'spotify',
      links: [
        { id: '1', title: 'Home', url: 'https://open.spotify.com' },
        { id: '2', title: 'Search', url: 'https://open.spotify.com/search' },
        { id: '3', title: 'Your Library', url: 'https://open.spotify.com/collection' },
        { id: '4', title: 'Liked Songs', url: 'https://open.spotify.com/collection/tracks' },
      ],
    },
    {
      name: 'youtube',
      links: [
        { id: '1', title: 'Home', url: 'https://music.youtube.com' },
        { id: '2', title: 'Explore', url: 'https://music.youtube.com/explore' },
        { id: '3', title: 'Library', url: 'https://music.youtube.com/library' },
        { id: '4', title: 'Liked Music', url: 'https://music.youtube.com/playlist?list=LM' },
      ],
    },
  ],
  defaultMusicService: 'spotify',
};

// Check if chrome.storage is available
const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
};

// In-memory fallback for development
let memoryStorage: Partial<StorageData> = {};

export async function getStorageData<K extends keyof StorageData>(
  key: K
): Promise<StorageData[K]> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] ?? defaultData[key]);
      });
    });
  }
  
  // Fallback for development
  const stored = localStorage.getItem(`nexus_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultData[key];
    }
  }
  return defaultData[key];
}

export async function setStorageData<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): Promise<void> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
  
  // Fallback for development
  localStorage.setItem(`nexus_${key}`, JSON.stringify(value));
}

export async function getAllStorageData(): Promise<StorageData> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve({ ...defaultData, ...result });
      });
    });
  }
  
  // Fallback for development
  const data: Partial<StorageData> = {};
  for (const key of Object.keys(defaultData) as (keyof StorageData)[]) {
    const stored = localStorage.getItem(`nexus_${key}`);
    if (stored) {
      try {
        data[key] = JSON.parse(stored);
      } catch {
        data[key] = defaultData[key] as any;
      }
    }
  }
  return { ...defaultData, ...data };
}

export async function clearAllStorageData(): Promise<void> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }
  
  // Fallback for development
  for (const key of Object.keys(defaultData)) {
    localStorage.removeItem(`nexus_${key}`);
  }
}

export { defaultData };
