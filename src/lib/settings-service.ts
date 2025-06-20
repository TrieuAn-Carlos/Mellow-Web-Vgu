import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AppSettings {
  AutoStart: boolean;
  Cflow: boolean;
}

const SETTINGS_COLLECTION = 'Settings';
const SETTINGS_DOC_ID = 'appSettings';

const DEFAULT_SETTINGS: AppSettings = {
  AutoStart: false,
  Cflow: false,
};

// Get settings from Firebase
export async function getSettings(): Promise<AppSettings> {
  try {
    const settingsDoc = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
    
    if (settingsDoc.exists()) {
      return { ...DEFAULT_SETTINGS, ...settingsDoc.data() } as AppSettings;
    }
    
    // If no settings exist, return defaults
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to Firebase
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), settings);
    console.log('Settings saved successfully:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Get settings from localStorage as fallback
export function getLocalSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('appSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting local settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to localStorage as backup
export function saveLocalSettings(settings: AppSettings): void {
  try {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving local settings:', error);
  }
} 