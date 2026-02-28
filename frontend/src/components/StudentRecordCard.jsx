import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';

const getGradeColor = (grade) => {
  switch (grade) {
    case 'A': return 'success';
    case 'B': return 'success';
    case 'C': return 'warning';
    case 'D': return 'warning';
    case 'F': return 'error';
    default: return 'muted';
  }
};

const StudentRecordCard = ({ record, userRole, onEdit, onDelete, onGradeChange }) => {
  const isTeacher = userRole === 'teacher';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="record-row"
    >
      <div className="record-info">
        <h3>{record.student_name}</h3>
        <span className="text-muted text-sm">ID: {record.student_id_number}</span>
      </div>
      
      <div className="record-grade">
        <strong className={`text-${getGradeColor(record.grade)}`}>
          {record.grade === 'Pending' ? 'Pending' : `Grade: ${record.grade}`}
        </strong>
      </div>

      <div className="record-actions">
        {isTeacher ? (
          <select 
            className="status-select"
            value={record.grade}
            onChange={(e) => onGradeChange(record._id, e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="A">A Grade</option>
            <option value="B">B Grade</option>
            <option value="C">C Grade</option>
            <option value="D">D Grade</option>
            <option value="F">F Grade</option>
          </select>
        ) : (
          <div className={`badge bg-${getGradeColor(record.grade)} text-white`}>
            {record.grade}
          </div>
        )}

        {isTeacher && (
          <div className="task-menu">
            <button className="icon-btn" onClick={() => onEdit(record)}>
              <Pencil size={18} />
            </button>
            <button className="icon-btn delete" onClick={() => onDelete(record._id)}>
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentRecordCard;
