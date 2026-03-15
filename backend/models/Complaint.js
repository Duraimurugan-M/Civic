const mongoose = require('mongoose');

const CATEGORY_CODES = {
  road: 'RD', water: 'WT', electricity: 'EL', garbage: 'GB',
  sewage: 'SW', park: 'PK', streetlight: 'SL', other: 'OT',
};

const complaintSchema = new mongoose.Schema({
  complaintCode: { type: String, unique: true, sparse: true },
  title:         { type: String, required: true, trim: true },
  description:   { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['road', 'water', 'electricity', 'garbage', 'sewage', 'park', 'streetlight', 'other'],
  },
  citizenId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  priority:     { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected', 'escalated'],
    default: 'pending',
  },
  supportCount:    { type: Number, default: 0 },
  images:          [{ type: String }],
  beforeImage:     { type: String },
  afterImage:      { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address:     { type: String },
  },
  deadline:        { type: Date },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:      { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1, category: 1 });
complaintSchema.index({ citizenId: 1 });
complaintSchema.index({ departmentId: 1 });

const SLA_HOURS = { low: 72, medium: 48, high: 24, emergency: 6 };

complaintSchema.pre('save', async function (next) {
  // Auto-generate complaint code with daily sequential number
  if (this.isNew && !this.complaintCode) {
    try {
      const catCode = CATEGORY_CODES[this.category] || 'OT';
      const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const prefix  = `CC-${catCode}-${today}`;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const count = await mongoose.model('Complaint').countDocuments({
        complaintCode: { $regex: `^${prefix}` },
        createdAt:     { $gte: startOfDay },
      });
      const seq = String(count + 1).padStart(4, '0');
      this.complaintCode = `${prefix}-${seq}`;
    } catch (e) {
      console.error('complaintCode generation error:', e.message);
    }
  }

  if (this.isNew && !this.deadline) {
    const hours  = SLA_HOURS[this.priority] || 48;
    this.deadline = new Date(Date.now() + hours * 3600000);
  }

  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);