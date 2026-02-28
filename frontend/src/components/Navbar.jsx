import { useAuth } from '../context/AuthContext';
import { LogOut, User, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <div className="nav-logo">
          <GraduationCap color="var(--accent-primary)" size={28} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Student Management</span>
        </div>
        
        <div className="nav-actions">
          <div className="nav-user">
            <User size={18} color="var(--text-secondary)" />
            <span>{user?.username}</span>
          </div>
          <button onClick={logout} className="btn-logout" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
