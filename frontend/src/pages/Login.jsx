import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [adminCode, setAdminCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await login(email, password, role, adminCode);
    
    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page-wrapper" style={{ position: 'relative', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <img 
          src="https://images.unsplash.com/photo-1622397333309-3056849bc70b?q=80&w=2070&auto=format&fit=crop" 
          alt="Prestigious University" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}></div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="auth-card glass"
          style={{ width: '100%', maxWidth: '400px', margin: '20px', padding: '40px' }}
        >
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent-primary)', padding: '16px', borderRadius: '50%' }}>
                <GraduationCap size={40} color="white" />
              </div>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.025em' }}>Welcome Back</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>Login to your academic portal</p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '32px' }}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  id="email"
                  className="input-field"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  id="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">Role</label>
              <div className="input-with-icon">
                <GraduationCap className="input-icon" size={18} />
                <select 
                  id="role"
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ paddingLeft: '2.75rem', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher (Admin)</option>
                </select>
              </div>
            </div>

            {role === 'teacher' && (
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label htmlFor="adminCode">School Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    id="adminCode"
                    className="input-field"
                    placeholder="Enter school password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
              style={{ marginTop: '24px', height: '48px', fontSize: '1rem', fontWeight: '600' }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              New to the portal? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Create account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
