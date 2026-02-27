import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import api from '../api';
import { Plus, Filter, LayoutGrid, List, Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  const fetchTasks = async () => {
    try {
      const { status, priority } = filters;
      let url = '/tasks?limit=100';
      if (status) url += `&status=${status}`;
      if (priority) url += `&priority=${priority}`;
      
      const response = await api.get(url);
      const fetchedTasks = response.data.data;
      setTasks(fetchedTasks);
      
      // Calculate stats
      const total = fetchedTasks.length;
      const pending = fetchedTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const completed = fetchedTasks.filter(t => t.status === 'completed').length;
      setStats({ total, pending, completed });
      
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters.status, filters.priority]);

  const handleCreateOrUpdate = async (formData, taskId = null) => {
    try {
      if (taskId) {
        await api.put(`/tasks/${taskId}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created successfully');
      }
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Action failed');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    task.description?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <main className="container dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Your Workspace</h1>
            <p>Welcome back! You have {stats.pending} active tasks.</p>
          </div>
          <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="btn btn-primary add-task-btn">
            <Plus size={20} />
            <span>Create Task</span>
          </button>
        </header>

        <section className="stats-row">
          <div className="stat-card glass">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">In Progress</span>
            <span className="stat-value text-warning">{stats.pending}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">Completed</span>
            <span className="stat-value text-success">{stats.completed}</span>
          </div>
        </section>

        <section className="controls-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-item">
              <Filter size={16} />
              <select 
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div className="filter-item">
              <SlidersHorizontal size={16} />
              <select 
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="loading-container">
            <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            <p>Loading tasks...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              <motion.div 
                layout
                className="task-grid"
              >
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state glass"
              >
                <h3>No tasks found</h3>
                <p>Try adjusting your search or filters, or create a new task.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
