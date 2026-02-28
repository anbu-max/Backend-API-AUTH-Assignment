import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

const StudentRecordModal = ({ isOpen, onClose, onSubmit, record }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_id_number: '',
    grade: 'Pending'
  });

  useEffect(() => {
    if (record) {
      setFormData({
        student_name: record.student_name,
        student_id_number: record.student_id_number,
        grade: record.grade
      });
    } else {
      setFormData({
        student_name: '',
        student_id_number: '',
        grade: 'Pending'
      });
    }
  }, [record, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, record?._id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
        >
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="modal-content glass"
          >
            <div className="modal-header">
              <h2>{record ? 'Edit Student Grade' : 'Add New Student'}</h2>
              <button type="button" onClick={onClose} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Student Full Name</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={formData.student_name}
                  onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                  required 
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Student ID / Roll No</label>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="e.g. STU-1001"
                    value={formData.student_id_number}
                    onChange={(e) => setFormData({...formData, student_id_number: e.target.value})}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Initial Grade Performance</label>
                  <select 
                    className="input-field"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="A">A Grade</option>
                    <option value="B">B Grade</option>
                    <option value="C">C Grade</option>
                    <option value="D">D Grade</option>
                    <option value="F">F / Fail</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={onClose} className="btn">Cancel</button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save size={18} />
                  {record ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudentRecordModal;
