const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true, minlength: 6, select: false },
  aadhaarNumber: { type: String, required: true, trim: true, unique: true },
  citizenId:     { type: String, unique: true, sparse: true },
  role:          { type: String, enum: ['citizen', 'staff', 'supervisor', 'admin'], default: 'citizen' },
  avatar:        { type: String, default: '' },
  departmentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isVerified:    { type: Boolean, default: true },
  isActive:      { type: Boolean, default: true },

  // Extended citizen profile fields
  phone:    { type: String, trim: true, default: '' },
  dob:      { type: String, default: '' },
  address:  { type: String, trim: true, default: '' },
  city:     { type: String, trim: true, default: '' },
  district: { type: String, trim: true, default: '' },
  state:    { type: String, trim: true, default: '' },
  pincode:  { type: String, trim: true, default: '' },

  // Track if citizen has completed their full profile
  profileComplete: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate citizenId for citizens before save
userSchema.pre('save', async function (next) {
  if (this.isNew && this.role === 'citizen' && !this.citizenId) {
    try {
      const aadhaar = (this.aadhaarNumber || '000000000000').replace(/\s/g, '');
      const firstTwo = aadhaar.slice(0, 2);
      const lastTwo  = aadhaar.slice(-2);
      const today    = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const prefix   = `CIV-${today}-${firstTwo}${lastTwo}`;

      // Count how many citizens already registered today to get next sequence
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const count = await mongoose.model('User').countDocuments({
        citizenId:  { $regex: `^${prefix}` },
        createdAt:  { $gte: startOfDay },
      });
      const seq = String(count + 1).padStart(4, '0');
      this.citizenId = `${prefix}-${seq}`;
    } catch (e) {
      console.error('citizenId generation error:', e.message);
    }
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);