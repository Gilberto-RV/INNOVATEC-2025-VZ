import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Building2, 
  Settings, 
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import './Sidebar.scss';

const menuItems = [
  { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
  { path: '/admin/calendario', icon: Calendar, label: 'Calendario' },
  { path: '/admin/eventos', icon: FileText, label: 'Eventos' },
  { path: '/admin/edificios', icon: Building2, label: 'Edificios' },
  { path: '/admin/ajustes', icon: Settings, label: 'Ajustes' }
];

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <Building2 size={28} />
          {!collapsed && <span>EventAdmin</span>}
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}