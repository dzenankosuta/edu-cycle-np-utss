import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Clock from './components/Clock';
import SchoolHeader from './components/SchoolHeader';
import ClassInfo from './components/ClassInfo';
import WindowControls from './components/WindowControls';
import ParticleBackground from './components/ParticleBackground';
// import NewsTicker from './components/NewsTicker';
import NewsImages from './components/NewsImages';
import SettingsModal from './components/SettingsModal';
import { WebSerialProvider } from './context/WebSerialProvider';
import { useSchedule } from './hooks/useSchedule';
import { useBellSystem } from './hooks/useBellSystem';
import { useAccurateTime } from './hooks/useAccurateTime';
import { useImages } from './hooks/useImages';
import './App.css';

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currentTime, isApiTime } = useAccurateTime();
  const { currentClass, nextClass, shift, isLoading, remainingTime } = useSchedule(currentTime);
  const { checkBellTime } = useBellSystem();
  const { images } = useImages();

  // Auto-fullscreen on first user interaction
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {
          console.error('Fullscreen error:', e);
        }
      }
      // Remove listeners after first trigger
      document.removeEventListener('click', enterFullscreen);
      document.removeEventListener('touchstart', enterFullscreen);
      document.removeEventListener('keydown', enterFullscreen);
    };

    // Attach listeners for any user interaction
    document.addEventListener('click', enterFullscreen);
    document.addEventListener('touchstart', enterFullscreen);
    document.addEventListener('keydown', enterFullscreen);

    return () => {
      document.removeEventListener('click', enterFullscreen);
      document.removeEventListener('touchstart', enterFullscreen);
      document.removeEventListener('keydown', enterFullscreen);
    };
  }, []);

  // Check bell time whenever currentTime or currentClass changes
  useEffect(() => {
    if (currentClass) {
      checkBellTime(currentClass, currentTime);
    }
  }, [currentClass, currentTime, checkBellTime]);

  return (
    <div className="app">
      <ParticleBackground />
      <WindowControls />

      {/* Settings Button */}
      <button
        className="settings-trigger-btn"
        onClick={() => setIsSettingsOpen(true)}
        title="Podešavanja"
      >
        ⚙️
      </button>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <div className="two-column-wrapper">
        {/* LEVA KOLONA - Schedule Info */}
        <motion.div
          className="main-container schedule-panel"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <SchoolHeader />

          <AnimatePresence mode="wait">
            {!isLoading && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="content"
              >
                <Clock currentTime={currentTime} isApiTime={isApiTime} />

                <ClassInfo
                  currentClass={currentClass}
                  nextClass={nextClass}
                  shift={shift}
                  remainingTime={remainingTime}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="loader"></div>
              <p>Učitavanje rasporeda...</p>
            </motion.div>
          )}
        </motion.div>

        {/* DESNA KOLONA - News Images */}
        <motion.div
          className="main-container news-panel"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <NewsImages images={images} />
        </motion.div>
      </div>

      {/* News Ticker - prikazuje se samo ako ima novosti */}
      {/* <NewsTicker /> */}
    </div>
  );
}

function App() {
  return (
    <WebSerialProvider>
      <AppContent />
    </WebSerialProvider>
  );
}

export default App
