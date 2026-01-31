import { Routes, Route } from 'react-router-dom';
import App from '../App';
import { AdminLogin } from '../admin/AdminLogin';
import { AdminLayout } from '../admin/AdminLayout';
import { AdminDashboard } from '../admin/AdminDashboard';
import { ProtectedRoute } from '../admin/components/ProtectedRoute';
import { ScheduleEditor } from '../admin/components/ScheduleEditor';
import { ImageManager } from '../admin/components/ImageManager';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<App />} />

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="schedule" element={<ScheduleEditor />} />
        <Route path="images" element={<ImageManager />} />
      </Route>
    </Routes>
  );
}
