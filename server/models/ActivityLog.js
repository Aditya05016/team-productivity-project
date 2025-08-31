const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'status_changed', 'assigned'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  oldValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);