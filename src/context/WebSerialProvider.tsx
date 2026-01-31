import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { WebSerialContext, type WebSerialContextType } from './WebSerialContext';

// Web Serial API types
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  writable: WritableStream;
  readable: ReadableStream;
}

interface Serial {
  requestPort(options?: object): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

declare global {
  interface Navigator {
    serial: Serial;
  }
}

const AUTO_CONNECT_STORAGE_KEY = 'edu-cycle-serial-auto-connect';
const SETTINGS_STORAGE_KEY = 'edu-cycle-settings';

interface WebSerialProviderProps {
  children: ReactNode;
}

export const WebSerialProvider = ({ children }: WebSerialProviderProps) => {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTO_CONNECT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const isRinging = useRef(false);

  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  // Helper: get settings from localStorage
  const getSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return { baudRate: 9600, bellDuration: 5000, bellEnabled: true };
  }, []);

  // Auto-connect na prethodno odobren port pri pokretanju aplikacije
  useEffect(() => {
    const autoConnect = async () => {
      if (!isSupported || !autoConnectEnabled || isConnected) return;

      try {
        // getPorts() vraća portove kojima je korisnik ranije dao pristup
        const ports = await navigator.serial.getPorts();

        if (ports.length > 0) {
          const savedPort = ports[0];
          const settings = getSettings();

          await savedPort.open({ baudRate: settings.baudRate });
          setPort(savedPort);
          setIsConnected(true);
          setError(null);
          console.log('✓ Auto-povezano sa prethodno odobrenim portom');
        }
      } catch (err) {
        console.warn('Auto-connect failed:', err);
        // Ne postavljaj error jer auto-connect nije kritičan
      }
    };

    autoConnect();
  }, [isSupported, autoConnectEnabled, getSettings, isConnected]);

  // Sačuvaj auto-connect preference
  useEffect(() => {
    try {
      localStorage.setItem(AUTO_CONNECT_STORAGE_KEY, JSON.stringify(autoConnectEnabled));
    } catch {
      // ignore
    }
  }, [autoConnectEnabled]);

  const connect = useCallback(async () => {
    // Ako je već povezano, ne radi ništa
    if (isConnected) {
      console.log('Već povezano, preskačem connect...');
      return;
    }

    if (!isSupported) {
      setError('Vaš browser ne podržava Serial API. Koristite Chrome ili Edge.');
      return;
    }

    try {
      setError(null);
      const settings = getSettings();
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: settings.baudRate });

      setPort(selectedPort);
      setIsConnected(true);
      console.log('✓ Povezano sa serial portom');
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name !== 'NotFoundError') {
        setError(`Greška pri povezivanju: ${error.message}`);
        console.error('Serial port error:', err);
      }
    }
  }, [isSupported, getSettings, isConnected]);

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
        setIsConnected(false);
        setError(null);
        console.log('✓ Prekinuta veza sa serial portom');
      } catch (err: unknown) {
        const error = err as Error;
        setError(`Greška pri prekidanju veze: ${error.message}`);
      }
    }
  }, [port]);

  const ringBell = useCallback(async (duration?: number) => {
    if (!port) {
      console.warn('Serial port nije povezan - ne mogu aktivirati zvono');
      return;
    }

    if (isRinging.current) {
      console.log('🔔 Zvono već zvoni, preskačem...');
      return;
    }

    const settings = getSettings();

    if (!settings.bellEnabled) {
      console.log('🔔 Zvono je onemogućeno u podešavanjima');
      return;
    }

    const bellDuration = duration ?? settings.bellDuration;

    try {
      isRinging.current = true;
      const writer = port.writable.getWriter();

      // Pošalji signal za početak zvona
      const startCommand = new Uint8Array([160, 1, 1, 162]);
      await writer.write(startCommand);
      console.log('🔔 Zvono aktivirano');

      // Zaustavi nakon podešenog trajanja
      setTimeout(async () => {
        try {
          const stopCommand = new Uint8Array([160, 1, 0, 161]);
          await writer.write(stopCommand);
          writer.releaseLock();
          console.log('🔔 Zvono zaustavljeno');
        } catch (err) {
          console.error('Greška pri zaustavljanju zvona:', err);
          try {
            writer.releaseLock();
          } catch {
            // ignore
          }
        }
        isRinging.current = false;
      }, bellDuration);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Greška pri aktiviranju zvona: ${error.message}`);
      isRinging.current = false;
    }
  }, [port, getSettings]);

  const value: WebSerialContextType = {
    port,
    isConnected,
    isSupported,
    connect,
    disconnect,
    ringBell,
    error,
    autoConnectEnabled,
    setAutoConnectEnabled,
  };

  return (
    <WebSerialContext.Provider value={value}>
      {children}
    </WebSerialContext.Provider>
  );
};
