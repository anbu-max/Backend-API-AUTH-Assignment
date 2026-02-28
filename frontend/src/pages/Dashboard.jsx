import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StudentRecordCard from '../components/StudentRecordCard';
import StudentRecordModal from '../components/StudentRecordModal';
import api from '../api';
import { Plus, Search, Loader2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchRecords = async () => {
    try {
      const response = await api.get('/students?limit=100');
      setRecords(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch student records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateOrUpdate = async (formData, recordId = null) => {
    try {
      if (recordId) {
        await api.put(`/students/${recordId}`, formData);
        toast.success('Record updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Record created successfully');
      }
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Action failed (Teachers only)');
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await api.delete(`/students/${recordId}`);
        toast.success('Record deleted');
        fetchRecords();
      } catch (error) {
        toast.error('Failed to delete record (Teachers only)');
      }
    }
  };

  const handleGradeChange = async (recordId, newGrade) => {
    try {
      await api.put(`/students/${recordId}`, { grade: newGrade });
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update grade (Teachers only)');
    }
  };

  const filteredRecords = records.filter(record => 
    record.student_name.toLowerCase().includes(search.toLowerCase()) ||
    record.student_id_number.toLowerCase().includes(search.toLowerCase())
  );

  // Removing the restricted dashboard view for students.
  // The table below natively supports read-only mode for students by hiding the Action buttons.
  return (
    <div className="dashboard-page">
      <Navbar />
      
      <main className="container dashboard-main">
        <header className="dashboard-header" style={{ position: 'relative', overflow: 'hidden', padding: '40px 20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
            alt="Dashboard Banner" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4))', zIndex: 1 }}></div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'var(--accent-primary)', padding: '12px', borderRadius: '50%' }}>
                <GraduationCap size={44} color="white" />
              </div>
              <div>
                <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '2rem' }}>Student Directory</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>Total Number of Students: {records.length}</p>
              </div>
            </div>
            {user?.role === 'teacher' && (
              <button 
                onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} 
                className="btn btn-primary add-task-btn"
                style={{ backgroundColor: 'var(--accent-primary)', border: 'none', padding: '10px 20px', fontSize: '1.05rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
              >
                <Plus size={20} />
                <span>Add Student</span>
              </button>
            )}
          </div>
        </header>

        <section className="controls-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or Student ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <div className="loading-container">
            <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            <p>Loading directory...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRecords.length > 0 ? (
              <motion.div 
                layout
                className="task-grid"
              >
                {filteredRecords.map(record => (
                  <StudentRecordCard 
                    key={record._id} 
                    record={record} 
                    userRole={user?.role}
                    onEdit={(r) => { setEditingRecord(r); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onGradeChange={handleGradeChange}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state glass"
              >
                <h3>No records found</h3>
                <p>The directory is currently empty.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <StudentRecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        record={editingRecord}
      />
    </div>
  );
};

export default Dashboard;
