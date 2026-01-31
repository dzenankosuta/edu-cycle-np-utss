import { motion } from 'framer-motion';
import { Calendar, Image, Clock } from 'lucide-react';
import { useAdminSchedule } from './hooks/useAdminSchedule';
import { useAdminImages } from './hooks/useAdminImages';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { schedule, isLoading: scheduleLoading } = useAdminSchedule();
  const { images, isLoading: imagesLoading } = useAdminImages();

  const firstShiftCount = schedule?.firstShift?.length || 0;
  const secondShiftCount = schedule?.secondShift?.length || 0;
  const activeImagesCount = images.filter((img) => img.active).length;
  const totalImagesCount = images.length;

  return (
    <div className="admin-dashboard">
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Pregled</h1>
        <p>Dobrodošli u admin panel Edu-Cycle aplikacije</p>
      </motion.div>

      <div className="dashboard-stats">
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon stat-icon--blue">
            <Calendar size={32} />
          </div>
          <div className="stat-content">
            <h3>Prva Smena</h3>
            <p className="stat-value">
              {scheduleLoading ? '...' : `${firstShiftCount} časova`}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon stat-icon--purple">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <h3>Druga Smena</h3>
            <p className="stat-value">
              {scheduleLoading ? '...' : `${secondShiftCount} časova`}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon stat-icon--green">
            <Image size={32} />
          </div>
          <div className="stat-content">
            <h3>Aktivne Slike</h3>
            <p className="stat-value">
              {imagesLoading ? '...' : `${activeImagesCount} / ${totalImagesCount}`}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-quick-actions">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Brze Akcije</h2>
          <div className="quick-actions-grid">
            <Link to="/admin/schedule" className="quick-action-card">
              <Calendar size={24} />
              <span>Uredi Raspored</span>
            </Link>
            <Link to="/admin/images" className="quick-action-card">
              <Image size={24} />
              <span>Upravljaj Slikama</span>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-info">
        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Upustva za korišćenje</h3>
          <ul>
            <li>
              <strong>Raspored:</strong> Dodajte, izmenite ili obrišite časove za prvu i drugu
              smenu. Promene se automatski prikazuju na glavnom ekranu.
            </li>
            <li>
              <strong>Slike:</strong> Dodajte URL-ove slika koje će se prikazivati u sekciji
              novosti. Možete ih aktivirati/deaktivirati i menjati redosled.
            </li>
            <li>
              <strong>Firebase:</strong> Sve promene se čuvaju u Firebase Realtime Database i
              odmah se sinhronizuju sa svim klijentima.
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
