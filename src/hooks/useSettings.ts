import { useState, useEffect, useCallback } from 'react';

export interface BellSettings {
  baudRate: number;
  bellDuration: number;
  bellEnabled: boolean;
}

const DEFAULT_SETTINGS: BellSettings = {
  baudRate: 9600,
  bellDuration: 5000,
  bellEnabled: true,
};

const STORAGE_KEY = 'edu-cycle-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<BellSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Proveri da li browser podržava Web Serial API
  const isWebSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  // Učitaj podešavanja iz localStorage pri inicijalizaciji
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Greška pri učitavanju podešavanja:', error);
    }
    setIsLoaded(true);
  }, []);

  // Sačuvaj podešavanja u localStorage kada se promene
  const saveSettings = useCallback((newSettings: Partial<BellSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Greška pri čuvanju podešavanja:', error);
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Greška pri resetovanju podešavanja:', error);
    }
  }, []);

  return {
    settings,
    saveSettings,
    resetSettings,
    isLoaded,
    isWebSerialSupported,
  };
};
