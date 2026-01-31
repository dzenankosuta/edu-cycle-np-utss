import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const SchoolHeader: React.FC = () => {
  return (
    <motion.div
      className="school-header"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={{ scale: 1.02, x: 10 }}
    >
      <motion.div
        className="logo-container"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src="/assets/logo.png" alt="Logo škole" className="school-logo" />
      </motion.div>

      <div className="school-info">
        <motion.h1
          className="school-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Ugostiteljsko-turistička škola Novi Pazar
        </motion.h1>
        <motion.div
          className="school-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <GraduationCap className="badge-icon" />
          <span>Vaša karijera u turizmu počinje ovde</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SchoolHeader;