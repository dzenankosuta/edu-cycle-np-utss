import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Image, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AdminSidebar() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
        <span className="admin-user-email">{user?.email}</span>
      </div>

      <nav className="admin-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Pregled</span>
        </NavLink>

        <NavLink
          to="/admin/schedule"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Calendar size={20} />
          <span>Raspored</span>
        </NavLink>

        <NavLink
          to="/admin/images"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Image size={20} />
          <span>Slike</span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={handleLogout} className="admin-logout-btn">
          <LogOut size={20} />
          <span>Odjava</span>
        </button>
      </div>
    </aside>
  );
}
