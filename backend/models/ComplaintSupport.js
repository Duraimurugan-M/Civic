const mongoose = require('mongoose');

const complaintSupportSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

complaintSupportSchema.index({ complaintId: 1, citizenId: 1 }, { unique: true });

module.exports = mongoose.model('ComplaintSupport', complaintSupportSchema);
