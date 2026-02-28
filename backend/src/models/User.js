const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: String,
  last_name: String,
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'user', 'admin'], 
    default: 'student' 
  },
  is_active: { type: Boolean, default: true },
  last_login: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Auto-update timestamp on save
userSchema.pre('save', function() {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('User', userSchema);
