import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, Trash2, Edit2, MoreVertical } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={18} color="var(--success)" />;
      case 'in_progress': return <Clock size={18} color="var(--info)" />;
      default: return <AlertCircle size={18} color="var(--warning)" />;
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="task-card glass-hover"
    >
      <div className="task-header">
        <span className="priority-badge" style={{ backgroundColor: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}>
          {task.priority}
        </span>
        <div className="task-menu">
          <button onClick={() => onEdit(task)} className="icon-btn" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(task._id)} className="icon-btn delete" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className={task.status === 'completed' ? 'completed' : ''}>{task.title}</h3>
      <p className="task-desc">{task.description || 'No description provided.'}</p>

      <div className="task-footer">
        <div className="status-indicator">
          {getStatusIcon(task.status)}
          <span>{task.status.replace('_', ' ')}</span>
        </div>
        
        <select 
          value={task.status} 
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="status-select"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

    </motion.div>
  );
};

export default TaskCard;
