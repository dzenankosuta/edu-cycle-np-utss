import { motion } from 'framer-motion';
import { Calendar, Clock as ClockIcon } from 'lucide-react';

interface ClockProps {
  currentTime: Date;
  isApiTime?: boolean;
}

const Clock: React.FC<ClockProps> = ({ currentTime, isApiTime = true }) => {
  const formatTime = () => {
    return currentTime.toLocaleTimeString('sr-RS', {
      timeZone: 'Europe/Belgrade',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = () => {
    return `${currentTime.getDate()}.${currentTime.getMonth() + 1}.${currentTime.getFullYear()}`;
  };

  return (
    <motion.div
      className="clock-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="date-display"
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Calendar className="icon" />
        <span>{formatDate()}</span>
      </motion.div>

      <motion.div
        className="time-display"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ClockIcon className="icon" />
        <span className="time-text">{formatTime()}</span>
        {!isApiTime && (
          <span className="time-source-warning" title="Koristi sistemsko vreme">⚠️</span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Clock;