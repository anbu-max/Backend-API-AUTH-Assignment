const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String, maxlength: 5000 },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'archived'],
    default: 'pending'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  due_date: Date,
  completed_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Indexes for performance
taskSchema.index({ user_id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ created_at: -1 });

module.exports = mongoose.model('Task', taskSchema);
