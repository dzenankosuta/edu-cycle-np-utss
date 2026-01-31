import { motion } from 'framer-motion';
import { Minimize2, Maximize2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const WindowControls: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(e.clientY <= 50);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Check initial state
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleClose = () => {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
      window.close();
    }
  };

  return (
    <motion.div
      className="window-controls"
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -20
      }}
      transition={{ duration: 0.2 }}
    >
      <button onClick={handleFullscreen} className="control-btn maximize">
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      <button onClick={handleClose} className="control-btn close">
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default WindowControls;
