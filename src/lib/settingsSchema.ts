import fs from 'fs';
import path from 'path';

export type AppSettings = {
  general: {
    siteTitle: string;
    enableRegistration: boolean;
    defaultLocale: string;
  };
  integrations: {
    sendgridApiKey?: string | null;
    slackWebhook?: string | null;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    showAvatars: boolean;
  };
};

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    siteTitle: 'My App',
    enableRegistration: true,
    defaultLocale: 'en'
  },
  integrations: {
    sendgridApiKey: null,
    slackWebhook: null
  },
  appearance: {
    theme: 'system',
    showAvatars: true
  }
};

const SETTINGS_PATH = path.resolve('db/settings.json');

export function loadSettings(): AppSettings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      // initialize
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed } as AppSettings;
  } catch (err) {
    console.error('Failed to load settings, falling back to defaults', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}
