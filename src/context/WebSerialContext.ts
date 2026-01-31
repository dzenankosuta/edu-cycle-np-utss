import { createContext } from 'react';

// Web Serial API types
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  writable: WritableStream;
  readable: ReadableStream;
}

export interface WebSerialContextType {
  port: SerialPort | null;
  isConnected: boolean;
  isSupported: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  ringBell: (duration?: number) => Promise<void>;
  error: string | null;
  autoConnectEnabled: boolean;
  setAutoConnectEnabled: (enabled: boolean) => void;
}

export const WebSerialContext = createContext<WebSerialContextType | null>(null);
