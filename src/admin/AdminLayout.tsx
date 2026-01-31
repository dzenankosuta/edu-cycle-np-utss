import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './components/AdminSidebar';
import './styles/admin.css';

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
