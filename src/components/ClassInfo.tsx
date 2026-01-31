import { motion } from 'framer-motion';
import { BookOpen, Clock, AlertCircle, Timer } from 'lucide-react';
import type { CurrentClass } from '../hooks/useSchedule';

interface ClassInfoProps {
  currentClass: CurrentClass | null;
  nextClass: any;
  shift: string;
  remainingTime?: string;
}

const ClassInfo: React.FC<ClassInfoProps> = ({ currentClass, nextClass, shift, remainingTime }) => {
  if (!currentClass && !shift) {
    return (
      <motion.div
        className="no-class-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AlertCircle className="icon" />
        <p>Van školskog vremena</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="class-info-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {shift && (
        <motion.div
          className="shift-badge"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {shift}
        </motion.div>
      )}

      {currentClass && (
        <>
          <motion.div
            className="current-class"
            whileHover={{ scale: 1.05 }}
          >
            <BookOpen className="icon" />
            <h2>
              {!currentClass.isBreak && currentClass.currentIndex
                ? `${currentClass.currentIndex}. čas`
                : currentClass.className}
            </h2>
            {remainingTime && remainingTime !== '00:00' && (
              <motion.div
                className="remaining-time"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  fontSize: '1.2rem',
                  color: '#94a3b8',
                  justifyContent: 'center'
                }}
              >
                <Timer size={20} />
                <span>Završava za: <strong>{remainingTime}</strong></span>
              </motion.div>
            )}
          </motion.div>

          {currentClass.isLastClass && (
            <motion.div
              className="last-class-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              Poslednji čas u smeni
            </motion.div>
          )}
        </>
      )}

      {nextClass && !currentClass?.isLastClass && (
        <motion.div
          className="next-class"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Clock className="icon" />
          <p>
            Sledeći: <strong>{nextClass.class}</strong> ({nextClass.start})
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClassInfo;