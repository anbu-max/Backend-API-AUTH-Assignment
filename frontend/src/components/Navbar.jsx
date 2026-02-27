import { useAuth } from '../context/AuthContext';
import { LogOut, User, CheckCircle2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <div className="nav-logo">
          <CheckCircle2 color="var(--accent-primary)" size={24} />
          <span>TaskFlow</span>
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
