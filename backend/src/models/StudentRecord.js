const mongoose = require('mongoose');

const studentRecordSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student_name: { type: String, required: true, maxlength: 255 },
  student_id_number: { type: String, required: true },
  grade: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D', 'F', 'Pending'],
    default: 'Pending'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Indexes for performance
studentRecordSchema.index({ teacher_id: 1 });
studentRecordSchema.index({ created_at: -1 });

module.exports = mongoose.model('StudentRecord', studentRecordSchema);
