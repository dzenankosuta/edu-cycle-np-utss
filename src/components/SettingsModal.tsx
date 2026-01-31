import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';
import { useWebSerialContext } from '../hooks/useWebSerialContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200];

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, saveSettings, isWebSerialSupported } = useSettings();
  const {
    isConnected,
    isSupported,
    connect,
    disconnect,
    ringBell,
    error: serialError,
    autoConnectEnabled,
    setAutoConnectEnabled,
  } = useWebSerialContext();

  const [isTesting, setIsTesting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = serialError || localError;

  const handleConnect = useCallback(async () => {
    if (!isWebSerialSupported) {
      setLocalError('Vaš browser ne podržava Web Serial API. Koristite Chrome ili Edge.');
      return;
    }
    setLocalError(null);
    await connect();
  }, [isWebSerialSupported, connect]);

  const handleDisconnect = useCallback(async () => {
    setLocalError(null);
    await disconnect();
  }, [disconnect]);

  const handleTestBell = useCallback(async () => {
    if (!isConnected) {
      setLocalError('Prvo se povežite sa serial portom');
      return;
    }

    try {
      setIsTesting(true);
      setLocalError(null);
      await ringBell(settings.bellDuration);
      // Bell will automatically stop after duration
      setTimeout(() => {
        setIsTesting(false);
      }, settings.bellDuration);
    } catch (err: unknown) {
      const error = err as Error;
      setLocalError(`Greška pri testiranju zvona: ${error.message}`);
      setIsTesting(false);
    }
  }, [isConnected, ringBell, settings.bellDuration]);

  const handleBaudRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveSettings({ baudRate: parseInt(e.target.value, 10) });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1000 && value <= 30000) {
      saveSettings({ bellDuration: value });
    }
  };

  const handleBellEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    saveSettings({ bellEnabled: e.target.checked });
  };

  const handleAutoConnectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoConnectEnabled(e.target.checked);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="settings-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="settings-header">
              <h2>Podešavanja</h2>
              <button className="settings-close-btn" onClick={onClose}>
                ✕
              </button>
            </div>

            <div className="settings-content">
              {/* Web Serial API upozorenje */}
              {!isWebSerialSupported && (
                <div className="settings-warning">
                  <span className="warning-icon">⚠️</span>
                  <div>
                    <strong>Web Serial API nije podržan</strong>
                    <p>Vaš browser ne podržava kontrolu hardverskog zvona. Koristite Chrome ili Edge (verzija 89+).</p>
                  </div>
                </div>
              )}

              {/* Serial Port sekcija */}
              <div className="settings-section">
                <h3>Serial Port</h3>

                <div className="settings-row">
                  <label>Status:</label>
                  <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '● Povezano' : '○ Nije povezano'}
                  </span>
                </div>

                <div className="settings-row">
                  <label htmlFor="baudRate">Baud Rate:</label>
                  <select
                    id="baudRate"
                    value={settings.baudRate}
                    onChange={handleBaudRateChange}
                    disabled={isConnected}
                  >
                    {BAUD_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-row">
                  <label htmlFor="bellDuration">Trajanje zvona (ms):</label>
                  <input
                    id="bellDuration"
                    type="number"
                    min="1000"
                    max="30000"
                    step="1000"
                    value={settings.bellDuration}
                    onChange={handleDurationChange}
                  />
                </div>

                <div className="settings-row">
                  <label htmlFor="bellEnabled">Omogući zvono:</label>
                  <input
                    id="bellEnabled"
                    type="checkbox"
                    checked={settings.bellEnabled}
                    onChange={handleBellEnabledChange}
                  />
                </div>

                <div className="settings-row">
                  <label htmlFor="autoConnect">Auto-povezivanje:</label>
                  <input
                    id="autoConnect"
                    type="checkbox"
                    checked={autoConnectEnabled}
                    onChange={handleAutoConnectChange}
                    disabled={!isSupported}
                  />
                </div>

                <div className="settings-buttons">
                  {!isConnected ? (
                    <button
                      className="settings-btn primary"
                      onClick={handleConnect}
                      disabled={!isWebSerialSupported}
                    >
                      Poveži Port
                    </button>
                  ) : (
                    <button className="settings-btn secondary" onClick={handleDisconnect}>
                      Prekini Vezu
                    </button>
                  )}

                  <button
                    className="settings-btn primary"
                    onClick={handleTestBell}
                    disabled={!isConnected || isTesting}
                  >
                    {isTesting ? 'Testiranje...' : 'Test Zvona'}
                  </button>
                </div>

                {error && <div className="settings-error">{error}</div>}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
