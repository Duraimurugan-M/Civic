const mongoose = require('mongoose');

const statusLogSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

statusLogSchema.index({ complaintId: 1 });

module.exports = mongoose.model('StatusLog', statusLogSchema);
