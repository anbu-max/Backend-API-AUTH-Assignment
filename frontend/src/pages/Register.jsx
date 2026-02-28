import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Loader2, UserCircle, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
    adminCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await register(formData);
    
    if (result.success) {
      toast.success('Account created successfully!');
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
          src="https://images.unsplash.com/photo-1525921429624-479b6a26d84d?q=80&w=2070&auto=format&fit=crop" 
          alt="Prestigious Campus" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="auth-card register-card glass"
          style={{ width: '100%', maxWidth: '500px', margin: '20px', padding: '40px' }}
        >
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent-primary)', padding: '16px', borderRadius: '50%' }}>
                <GraduationCap size={40} color="white" />
              </div>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.025em' }}>Join Our Community</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>Create your academic account today</p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '32px' }}>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-with-icon">
                  <UserCircle className="input-icon" size={18} />
                  <input 
                    type="text" 
                    id="firstName"
                    className="input-field"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-with-icon">
                  <UserCircle className="input-icon" size={18} />
                  <input 
                    type="text" 
                    id="lastName"
                    className="input-field"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  id="email"
                  className="input-field"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
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
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">I am a...</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <select 
                  id="role"
                  className="input-field"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.75rem', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher (Admin)</option>
                </select>
              </div>
            </div>

            {formData.role === 'teacher' && (
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label htmlFor="adminCode">School Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    id="adminCode"
                    className="input-field"
                    placeholder="Enter school password"
                    value={formData.adminCode}
                    onChange={handleChange}
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
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Already registered? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
