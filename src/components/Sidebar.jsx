import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Printer, 
  CreditCard, 
  Scale, 
  Fingerprint, 
  Network, 
  LogOut,
  RefreshCw,
  BarChart3,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Desktop', icon: <Monitor size={20} />, path: '/dashboard/desktop' },
  { name: 'Laptops', icon: <Laptop size={20} />, path: '/dashboard/laptops' },
  { name: 'Mobile', icon: <Smartphone size={20} />, path: '/dashboard/mobile' },
  { name: 'Printer', icon: <Printer size={20} />, path: '/dashboard/printer' },
  { name: 'POS', icon: <CreditCard size={20} />, path: '/dashboard/pos' },
  { name: 'Weighing Scale', icon: <Scale size={20} />, path: '/dashboard/weighing-scale' },
  { name: 'Biometric', icon: <Fingerprint size={20} />, path: '/dashboard/biometric' },
  { name: 'Switch', icon: <Network size={20} />, path: '/dashboard/switch' },
  { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/dashboard/analytics' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar-container glass">
      <div className="sidebar-logo" style={{ marginBottom: '40px' }}>
        <img 
          src="/maylaa-logo.png" 
          alt="Maylaa Logo" 
          style={{ width: '120px', marginBottom: '16px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h3 className="gradient-text" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Maylaa International Trading</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Asset Management
        </span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink 
            to="/dashboard/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}
          >
            <Shield size={20} />
            <span>User Control</span>
          </NavLink>
        )}
      </div>

      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: '800',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user?.username}</div>
            <div className="badge badge-success" style={{ fontSize: '0.65rem' }}>{user?.role}</div>
          </div>
        </div>

        <button className="btn btn-ghost" style={{ width: '100%', marginBottom: '10px' }} onClick={() => navigate('/select-entity')}>
          <RefreshCw size={18} />
          <span>Switch Entity</span>
        </button>

        <button className="btn btn-ghost" style={{ width: '100%', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
